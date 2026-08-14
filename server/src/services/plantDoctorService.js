import { env } from "../config/env.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const VISION_MODEL = "gemini-3.6-flash";

const SYSTEM_PROMPT = `You are KisanBandhu Plant Doctor — an expert agricultural AI assistant for Indian farmers.

When given a plant or leaf image, you MUST respond ONLY with a valid JSON object in this exact structure:

{
  "cropIdentified": "Name of the crop (e.g. Tomato, Rice, Wheat, Cotton)",
  "commonName": "Common name of the plant/crop",
  "scientificName": "Scientific name of the plant/crop",
  "growthStage": "Seedling | Vegetative | Flowering | Fruiting | Harvesting | Mature",
  "confidence": "High | Medium | Low",
  "plantHealth": "Healthy | Diseased | Stressed | Pest-Infested | Unknown",
  "diseaseDetected": "Disease name or null if healthy",
  "diseaseSeverity": "Mild | Moderate | Severe | null",
  "symptoms": ["symptom 1", "symptom 2"],
  "cause": "Brief scientific cause of the disease or condition",
  "immediateActions": ["action 1", "action 2", "action 3"],
  "treatment": {
    "organic": ["organic treatment 1", "organic treatment 2"],
    "chemical": ["chemical treatment with dosage 1", "chemical treatment 2"],
    "preventive": ["prevention tip 1", "prevention tip 2"]
  },
  "cultivationRequirements": {
    "soil": "Soil requirements description (e.g. well-drained sandy loam, pH 6.0-7.0)",
    "watering": "Watering requirements description (e.g. keep moist but not soggy)",
    "temperature": "Temperature range description (e.g. 21-29°C)",
    "sunlight": "Sunlight requirements description (e.g. full sun, 6-8 hours daily)"
  },
  "nutrientDeficiencies": "Nutrient deficiency observed (e.g. Nitrogen Deficiency) or null if none",
  "fertilizerSuggestions": ["fertilizer suggestion 1", "fertilizer suggestion 2"],
  "irrigationGuidance": ["irrigation guidance 1", "irrigation guidance 2"],
  "cropManagementTips": ["crop management tip 1", "crop management tip 2"],
  "yieldMaximizationTips": ["yield maximization tip 1", "yield maximization tip 2"],
  "growingAdvice": ["advice 1", "advice 2", "advice 3"],
  "bestSeason": "Kharif | Rabi | Zaid | Year-round",
  "estimatedYieldImpact": "Brief impact on yield if disease left untreated, or null if healthy",
  "governmentSchemes": ["relevant scheme 1", "relevant scheme 2"],
  "shouldConsultExpert": true or false,
  "expertAdvice": "When and why to consult an agricultural officer or veterinarian"
}

Rules:
- Always return valid JSON, nothing else
- If the image is NOT a plant, set cropIdentified to "Not a plant" and explain in expertAdvice
- Be specific to Indian farming conditions
- Include Kisan Call Center (1800-180-1551) in expertAdvice when shouldConsultExpert is true
- Keep all text fields concise and actionable`;

export async function analyzePlantImage({ imageBase64, mimeType }) {
  const apiKey = env.gemini?.apiKey;
  if (!apiKey) throw new Error("Gemini API key not configured");

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: VISION_MODEL });

    // The Gemini API requires the base64 string *without* the data URI prefix
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const prompt = `${SYSTEM_PROMPT}\n\nTask: Analyze this plant image and provide a complete diagnosis as JSON.`;
    
    const imageParts = [
      {
        inlineData: {
          data: base64Data,
          mimeType
        }
      }
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const raw = response.text().trim();

    if (!raw) throw new Error("Empty response from vision model");

    // Extract JSON even if the model wraps it in markdown
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse AI response as JSON");

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    if (error.status === 429) {
      const customError = new Error("The AI service is experiencing high traffic. Please wait 60 seconds before scanning another plant.");
      customError.statusCode = 429;
      customError.isOperational = true;
      throw customError;
    }
    
    const customError = new Error(`Vision API error: ${error.message}`);
    customError.statusCode = 500;
    customError.isOperational = true;
    throw customError;
  }
}
