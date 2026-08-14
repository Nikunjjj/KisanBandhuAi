import { env } from "../config/env.js";

const LIVESTOCK_AI_MODEL = "llama-3.1-8b-instant";

const LIVESTOCK_SYSTEM_PROMPT = `
You are KisanBandhu Livestock Doctor — an expert veterinary AI assistant for Indian farmers.

When given a list of symptoms or a description of a sick animal (cow, buffalo, goat, sheep, poultry, etc.), you MUST respond ONLY with a valid JSON object in this exact structure:

{
  "diseaseIdentified": "Most likely disease name (e.g. Foot-and-Mouth Disease, Mastitis) or 'Unknown'",
  "confidence": "High | Medium | Low",
  "diseaseDescription": "Brief description of the disease",
  "commonSymptoms": ["symptom 1", "symptom 2"],
  "possibleCauses": "Brief scientific cause of the disease",
  "isContagious": true or false,
  "isolationPrecautions": "Isolation instructions if contagious, or null",
  "emergencySteps": ["immediate emergency step 1", "immediate emergency step 2"],
  "firstAidInstructions": ["first aid step 1", "first aid step 2"],
  "suggestedTreatment": {
    "organic": ["organic remedy 1", "organic remedy 2"],
    "chemical": ["chemical medicine/treatment with dosage 1", "chemical treatment 2"],
    "preventive": ["prevention tip 1", "prevention tip 2"]
  },
  "vaccinationRecommendations": ["vaccine 1", "vaccine 2"],
  "shouldConsultVet": true or false,
  "expertAdvice": "When and why to consult a veterinarian"
}

Rules:
- Always return valid JSON, nothing else. No markdown wrappers.
- Be specific to Indian farming and common regional diseases.
- Include Kisan Call Center (1800-180-1551) in expertAdvice when shouldConsultVet is true.
- Keep all text fields concise and actionable.
`;

export async function analyzeLivestockSymptoms(animalDetails, symptomsText) {
  const apiKey = env.groq.apiKey;
  if (!apiKey) throw new Error("Groq API key not configured");

  // Construct the prompt combining animal details and symptoms
  const userPrompt = `
Animal Details: ${animalDetails}
Observed Symptoms / Description: ${symptomsText}

Task: Analyze these symptoms for the specified animal and provide a complete diagnosis as JSON.
  `;

  // We are stripping newlines from the SYSTEM_PROMPT to avoid the API gateway parsing bug seen previously.
  const formattedSystemPrompt = LIVESTOCK_SYSTEM_PROMPT.replace(/\n/g, " ");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: LIVESTOCK_AI_MODEL,
      messages: [
        {
          role: "user",
          content: `${formattedSystemPrompt} ${userPrompt}`
        }
      ],
      temperature: 0.3,
      max_tokens: 1500
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    if (response.status === 429) {
      const error = new Error("The AI service is experiencing high traffic. Please wait 60 seconds before diagnosing another animal.");
      error.statusCode = 429;
      error.isOperational = true;
      throw error;
    }
    const error = new Error(`Livestock AI error ${response.status}: ${errText}`);
    error.statusCode = 500;
    error.isOperational = true;
    throw error;
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from Livestock AI");

  try {
    // Strip <think> blocks if Qwen includes chain-of-thought
    let cleanedContent = content;
    if (cleanedContent.includes("<think>")) {
      cleanedContent = cleanedContent.replace(/<think>[\s\S]*?<\/think>/, "").trim();
    }

    // Extract JSON block if surrounded by markdown code block
    const jsonStr = cleanedContent.includes("\`\`\`") 
      ? cleanedContent.replace(/```(?:json)?\n?/g, "").split("\`\`\`")[0].trim() 
      : cleanedContent.trim();
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Failed to parse Livestock AI response:", content);
    throw new Error("Failed to parse AI diagnosis response");
  }
}
