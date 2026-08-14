import { Scheme } from "../models/Scheme.js";
import { env } from "../config/env.js";
import { rankSchemesForProfile } from "./recommendationService.js";

const CATEGORY_INTENTS = [
  { terms: ["irrigation", "water", "सिंचाई", "ನೀರಾವರಿ"], category: "Irrigation support" },
  { terms: ["solar", "kusum", "सोलर", "सौर", "ಸೌರ"], category: "Solar panel subsidy schemes" },
  { terms: ["insurance", "crop damage", "fasal bima", "फसल बीमा", "ಬೆಳೆ ವಿಮೆ"], category: "Crop damage and insurance schemes" },
  { terms: ["drip", "sprinkler", "ड्रिप", "स्प्रिंकलर"], category: "Drip and sprinkler subsidies" },
  { terms: ["seed", "बीज", "ಬೀಜ"], category: "Crop seed purchase schemes" },
  { terms: ["livestock", "dairy", "animal", "पशुधन", "डेयरी", "ಪಶು", "ಹಾಲು"], category: "Livestock and dairy schemes" },
  { terms: ["dbt", "direct benefit", "kisan samman", "डीबीटी", "ಡಿಬಿಟಿ"], category: "DBT schemes" },
  { terms: ["housing", "awas", "घर", "आवास", "ವಸತಿ"], category: "Housing schemes" },
  { terms: ["financial", "loan", "finance", "money", "वित्तीय", "ಸಹಾಯ"], category: "Financial assistance schemes" },
  { terms: ["agriculture", "farming", "crop", "कृषि", "खेती", "ಕೃಷಿ"], category: "Agriculture schemes" }
];

function normalize(value) {
  return String(value || "").toLowerCase();
}

function includesAny(message, terms) {
  return terms.some((term) => message.includes(normalize(term)));
}

export function detectIntent(message) {
  const normalized = normalize(message);
  const categoryMatch = CATEGORY_INTENTS.find((item) => includesAny(normalized, item.terms));

  if (includesAny(normalized, ["eligible", "eligibility", "qualify", "पात्र", "ಅರ್ಹ"])) {
    return { type: "eligibility", category: categoryMatch?.category };
  }

  if (includesAny(normalized, ["apply", "application", "how can i apply", "आवेदन", "ಅರ್ಜಿ"])) {
    return { type: "application", category: categoryMatch?.category };
  }

  if (includesAny(normalized, ["small farmer", "marginal", "below 2", "छोटे किसान", "ಸಣ್ಣ ರೈತ"])) {
    return { type: "small_farmer", category: categoryMatch?.category };
  }

  if (includesAny(normalized, ["recommend", "suggest", "which scheme", "show", "बताओ", "दिखाएं", "ತೋರಿಸಿ"])) {
    return { type: "recommendation", category: categoryMatch?.category };
  }

  if (categoryMatch) {
    return { type: "category_search", category: categoryMatch.category };
  }

  if (includesAny(normalized, ["livestock", "dairy", "animal", "cow", "buffalo", "goat"])) {
    return { type: "farming_support", category: "Livestock and dairy schemes" };
  }

  return { type: "general" };
}

function formatSchemeList(schemes) {
  return schemes.map((scheme) => ({
    id: scheme._id,
    schemeName: scheme.schemeName,
    category: scheme.category,
    applicationLink: scheme.applicationLink,
    score: scheme.recommendation?.score,
    eligibility: scheme.recommendation?.eligibility,
    reason: scheme.recommendation?.reasons?.[0] || "Relevant to your query."
  }));
}

const languageLabels = {
  en: "English",
  hi: "Hindi",
  kn: "Kannada"
};

const responseTranslations = {
  hi: {
    "Relevant to your query.": "आपके सवाल से संबंधित।",
    "Check my recommendations": "मेरी सिफारिशें दिखाएं",
    "Show required documents": "जरूरी दस्तावेज दिखाएं",
    "Update farmer profile": "किसान प्रोफाइल अपडेट करें",
    "Show crop insurance support": "फसल बीमा सहायता दिखाएं",
    "Show DBT schemes": "डीबीटी योजनाएं दिखाएं",
    "Show solar subsidy schemes": "सोलर सब्सिडी योजनाएं दिखाएं",
    "Show irrigation schemes": "सिंचाई योजनाएं दिखाएं",
    "Check my eligibility": "मेरी पात्रता जांचें",
    "Update livestock profile": "पशुधन प्रोफाइल अपडेट करें",
    "Show dairy schemes": "डेयरी योजनाएं दिखाएं",
    "Show financial assistance": "वित्तीय सहायता दिखाएं",
    "Check eligibility": "पात्रता जांचें",
    "Show latest schemes": "नई योजनाएं दिखाएं",
    "Show recommendations": "सिफारिशें दिखाएं",
    "Which schemes help small farmers?": "छोटे किसानों के लिए कौन सी योजनाएं हैं?",
    "How can I apply for crop insurance?": "मैं फसल बीमा के लिए कैसे आवेदन करूं?"
  },
  kn: {
    "Relevant to your query.": "ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಸಂಬಂಧಿಸಿದೆ.",
    "Check my recommendations": "ನನ್ನ ಶಿಫಾರಸುಗಳನ್ನು ತೋರಿಸಿ",
    "Show required documents": "ಅಗತ್ಯ ದಾಖಲೆಗಳನ್ನು ತೋರಿಸಿ",
    "Update farmer profile": "ರೈತ ಪ್ರೊಫೈಲ್ ನವೀಕರಿಸಿ",
    "Show crop insurance support": "ಬೆಳೆ ವಿಮೆ ಬೆಂಬಲ ತೋರಿಸಿ",
    "Show DBT schemes": "ಡಿಬಿಟಿ ಯೋಜನೆಗಳನ್ನು ತೋರಿಸಿ",
    "Show solar subsidy schemes": "ಸೌರ ಸಬ್ಸಿಡಿ ಯೋಜನೆಗಳನ್ನು ತೋರಿಸಿ",
    "Show irrigation schemes": "ನೀರಾವರಿ ಯೋಜನೆಗಳನ್ನು ತೋರಿಸಿ",
    "Check my eligibility": "ನನ್ನ ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ",
    "Update livestock profile": "ಪಶುಸಂಗೋಪನೆ ಪ್ರೊಫೈಲ್ ನವೀಕರಿಸಿ",
    "Show dairy schemes": "ಹಾಲು ಉತ್ಪಾದನಾ ಯೋಜನೆಗಳನ್ನು ತೋರಿಸಿ",
    "Show financial assistance": "ಆರ್ಥಿಕ ಸಹಾಯ ತೋರಿಸಿ",
    "Check eligibility": "ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ",
    "Show latest schemes": "ಹೊಸ ಯೋಜನೆಗಳನ್ನು ತೋರಿಸಿ",
    "Show recommendations": "ಶಿಫಾರಸುಗಳನ್ನು ತೋರಿಸಿ",
    "Which schemes help small farmers?": "ಸಣ್ಣ ರೈತರಿಗೆ ಯಾವ ಯೋಜನೆಗಳು ಸಹಾಯ ಮಾಡುತ್ತವೆ?",
    "How can I apply for crop insurance?": "ಬೆಳೆ ವಿಮೆಗೆ ನಾನು ಹೇಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಬಹುದು?"
  }
};

function translateList(items, language) {
  return items.map((item) => responseTranslations[language]?.[item] || item);
}

function buildResponse({ intent, schemes, profile, language = "en" }) {
  const topSchemes = schemes.slice(0, 3);
  const names = topSchemes.map((scheme) => scheme.schemeName).join(", ");
  const statePhrase = profile.state ? ` in ${profile.state}` : "";
  const noMatches = names || "no exact matches yet";

  if (intent.type === "eligibility") {
    return {
      answer: localizedAnswer(language, "eligibility", { names }),
      suggestions: translateList(["Check my recommendations", "Show required documents", "Update farmer profile"], language)
    };
  }

  if (intent.type === "application") {
    return {
      answer: localizedAnswer(language, "application", { firstName: topSchemes[0]?.schemeName }),
      suggestions: translateList(["Show crop insurance support", "Show DBT schemes", "Show solar subsidy schemes"], language)
    };
  }

  if (intent.type === "small_farmer") {
    return {
      answer: localizedAnswer(language, "small_farmer", { statePhrase, noMatches }),
      suggestions: translateList(["Show DBT schemes", "Show irrigation schemes", "Check my eligibility"], language)
    };
  }

  if (intent.type === "farming_support") {
    return {
      answer: localizedAnswer(language, "farming_support", { names }),
      suggestions: translateList(["Update livestock profile", "Show dairy schemes", "Show financial assistance"], language)
    };
  }

  if (intent.category) {
    return {
      answer: localizedAnswer(language, "category", { category: intent.category, names }),
      suggestions: translateList(["Check eligibility", "Show latest schemes", "Show recommendations"], language)
    };
  }

  return {
    answer: localizedAnswer(language, "general"),
    suggestions: translateList(["Which schemes help small farmers?", "How can I apply for crop insurance?", "Show solar subsidy schemes"], language)
  };
}

function localizedAnswer(language, key, values = {}) {
  const templates = {
    en: {
      eligibility: values.names
        ? `Based on your profile, these schemes look most relevant: ${values.names}. Open any scheme detail page to see the eligibility prediction, required documents, and application link.`
        : "I could not find a strong eligibility match yet. Please complete your state, land size, crop type, income category, and farmer category in your profile.",
      application: values.firstName
        ? `For application help, start with ${values.firstName}. Keep Aadhaar, bank details, land records, and crop or livestock proof ready where applicable. Use the official application link shown on the scheme detail page.`
        : "To apply for a scheme, open the scheme detail page, check eligibility and documents, then use the official application portal link.",
      small_farmer: `For small or marginal farmers${values.statePhrase}, DBT, crop insurance, irrigation subsidy, and financial assistance schemes are usually the best starting points. I found: ${values.noMatches}.`,
      farming_support: values.names
        ? `For livestock and dairy support, review ${values.names}. These schemes may help with animal health, dairy productivity, and farmer income support.`
        : "For livestock support, add your livestock details in your profile so I can recommend dairy and animal husbandry schemes more accurately.",
      category: values.names
        ? `I found ${values.category.toLowerCase()} matching your query: ${values.names}.`
        : `I could not find published schemes in ${values.category} for your current filters.`,
      general: "I can help you find government schemes, check eligibility, explain application steps, and suggest crop, livestock, DBT, insurance, solar, and irrigation support based on your farmer profile."
    },
    hi: {
      eligibility: values.names
        ? `आपकी प्रोफाइल के आधार पर ये योजनाएं सबसे अधिक उपयोगी लगती हैं: ${values.names}. किसी भी योजना के विवरण पेज पर पात्रता अनुमान, जरूरी दस्तावेज और आवेदन लिंक देखें।`
        : "मजबूत पात्रता मिलान अभी नहीं मिला। कृपया अपनी प्रोफाइल में राज्य, भूमि का आकार, फसल, आय वर्ग और किसान श्रेणी पूरी करें।",
      application: values.firstName
        ? `आवेदन सहायता के लिए ${values.firstName} से शुरू करें। आधार, बैंक विवरण, भूमि रिकॉर्ड और जहां लागू हो वहां फसल या पशुधन प्रमाण तैयार रखें। योजना विवरण पेज पर दिया आधिकारिक आवेदन लिंक उपयोग करें।`
        : "योजना के लिए आवेदन करने के लिए विवरण पेज खोलें, पात्रता और दस्तावेज जांचें, फिर आधिकारिक आवेदन पोर्टल लिंक उपयोग करें।",
      small_farmer: `छोटे या सीमांत किसानों${values.statePhrase} के लिए डीबीटी, फसल बीमा, सिंचाई सब्सिडी और वित्तीय सहायता योजनाएं अच्छी शुरुआत हैं। मिला: ${values.noMatches}.`,
      farming_support: values.names
        ? `पशुधन और डेयरी सहायता के लिए ${values.names} देखें। ये योजनाएं पशु स्वास्थ्य, डेयरी उत्पादकता और किसान आय में मदद कर सकती हैं।`
        : "पशुधन सहायता के लिए अपनी प्रोफाइल में पशुधन विवरण जोड़ें ताकि मैं डेयरी और पशुपालन योजनाएं बेहतर सुझा सकूं।",
      category: values.names
        ? `आपके सवाल से मेल खाती ${values.category} योजनाएं मिलीं: ${values.names}.`
        : `आपके मौजूदा फिल्टर में ${values.category} की प्रकाशित योजनाएं नहीं मिलीं।`,
      general: "मैं सरकारी योजनाएं खोजने, पात्रता जांचने, आवेदन के चरण समझाने, और आपकी किसान प्रोफाइल के आधार पर फसल, पशुधन, डीबीटी, बीमा, सोलर और सिंचाई सहायता सुझाने में मदद कर सकता हूं।"
    },
    kn: {
      eligibility: values.names
        ? `ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಆಧಾರದಲ್ಲಿ ಈ ಯೋಜನೆಗಳು ಹೆಚ್ಚು ಸೂಕ್ತವಾಗಿವೆ: ${values.names}. ಅರ್ಹತಾ ಅಂದಾಜು, ಅಗತ್ಯ ದಾಖಲೆಗಳು ಮತ್ತು ಅರ್ಜಿ ಲಿಂಕ್ ನೋಡಲು ಯಾವುದೇ ಯೋಜನೆಯ ವಿವರ ಪುಟ ತೆರೆಯಿರಿ.`
        : "ಬಲವಾದ ಅರ್ಹತಾ ಹೊಂದಾಣಿಕೆ ಇನ್ನೂ ಸಿಕ್ಕಿಲ್ಲ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ರಾಜ್ಯ, ಭೂಮಿಯ ಗಾತ್ರ, ಬೆಳೆ, ಆದಾಯ ವರ್ಗ ಮತ್ತು ರೈತ ವರ್ಗವನ್ನು ಪ್ರೊಫೈಲ್‌ನಲ್ಲಿ ಪೂರ್ಣಗೊಳಿಸಿ.",
      application: values.firstName
        ? `ಅರ್ಜಿ ಸಹಾಯಕ್ಕಾಗಿ ${values.firstName} ಯಿಂದ ಪ್ರಾರಂಭಿಸಿ. ಆಧಾರ್, ಬ್ಯಾಂಕ್ ವಿವರಗಳು, ಭೂ ದಾಖಲೆಗಳು ಮತ್ತು ಅನ್ವಯಿಸಿದಲ್ಲಿ ಬೆಳೆ ಅಥವಾ ಪಶುಸಂಗೋಪನೆ ಪ್ರಮಾಣ ಸಿದ್ಧವಾಗಿರಲಿ. ಯೋಜನೆ ವಿವರ ಪುಟದಲ್ಲಿರುವ ಅಧಿಕೃತ ಅರ್ಜಿ ಲಿಂಕ್ ಬಳಸಿ.`
        : "ಯೋಜನೆಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ವಿವರ ಪುಟ ತೆರೆಯಿರಿ, ಅರ್ಹತೆ ಮತ್ತು ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ, ನಂತರ ಅಧಿಕೃತ ಅರ್ಜಿ ಪೋರ್ಟಲ್ ಲಿಂಕ್ ಬಳಸಿ.",
      small_farmer: `ಸಣ್ಣ ಅಥವಾ ಅಂಚಿನ ರೈತರಿಗೆ${values.statePhrase} ಡಿಬಿಟಿ, ಬೆಳೆ ವಿಮೆ, ನೀರಾವರಿ ಸಬ್ಸಿಡಿ ಮತ್ತು ಆರ್ಥಿಕ ಸಹಾಯ ಯೋಜನೆಗಳು ಉತ್ತಮ ಆರಂಭ. ಕಂಡುಬಂದವು: ${values.noMatches}.`,
      farming_support: values.names
        ? `ಪಶುಸಂಗೋಪನೆ ಮತ್ತು ಹಾಲು ಉತ್ಪಾದನಾ ಬೆಂಬಲಕ್ಕಾಗಿ ${values.names} ಪರಿಶೀಲಿಸಿ. ಈ ಯೋಜನೆಗಳು ಪ್ರಾಣಿಗಳ ಆರೋಗ್ಯ, ಹಾಲು ಉತ್ಪಾದಕತೆ ಮತ್ತು ರೈತರ ಆದಾಯಕ್ಕೆ ಸಹಾಯ ಮಾಡಬಹುದು.`
        : "ಪಶುಸಂಗೋಪನೆ ಬೆಂಬಲಕ್ಕಾಗಿ ನಿಮ್ಮ ಪ್ರೊಫೈಲ್‌ನಲ್ಲಿ ಪಶು ವಿವರಗಳನ್ನು ಸೇರಿಸಿ, ಆಗ ನಾನು ಹಾಲು ಮತ್ತು ಪಶುಸಂಗೋಪನೆ ಯೋಜನೆಗಳನ್ನು ಹೆಚ್ಚು ಸರಿಯಾಗಿ ಶಿಫಾರಸು ಮಾಡಬಹುದು.",
      category: values.names
        ? `ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಹೊಂದುವ ${values.category} ಯೋಜನೆಗಳು ಸಿಕ್ಕಿವೆ: ${values.names}.`
        : `ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಫಿಲ್ಟರ್‌ಗಳಿಗೆ ${values.category} ಯ ಪ್ರಕಟಿತ ಯೋಜನೆಗಳು ಸಿಗಲಿಲ್ಲ.`,
      general: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕುವುದು, ಅರ್ಹತೆ ಪರಿಶೀಲಿಸುವುದು, ಅರ್ಜಿ ಹಂತಗಳನ್ನು ವಿವರಿಸುವುದು, ಮತ್ತು ನಿಮ್ಮ ರೈತ ಪ್ರೊಫೈಲ್ ಆಧಾರದಲ್ಲಿ ಬೆಳೆ, ಪಶುಸಂಗೋಪನೆ, ಡಿಬಿಟಿ, ವಿಮೆ, ಸೌರ ಮತ್ತು ನೀರಾವರಿ ಬೆಂಬಲವನ್ನು ಸೂಚಿಸುವುದರಲ್ಲಿ ನಾನು ಸಹಾಯ ಮಾಡಬಹುದು."
    }
  };

  return templates[language]?.[key] || templates.en[key];
}

function schemeContext(schemes) {
  return schemes.slice(0, 5).map((scheme) => ({
    name: scheme.schemeName,
    category: scheme.category,
    stateApplicability: scheme.stateApplicability,
    eligibility: scheme.recommendation?.eligibility,
    matchScore: scheme.recommendation?.score,
    reason: scheme.recommendation?.reasons?.[0],
    benefits: scheme.benefits?.slice?.(0, 4) || [],
    requiredDocuments: scheme.requiredDocuments?.slice?.(0, 6) || [],
    applicationLink: scheme.applicationLink
  }));
}

function extractOpenAIText(response) {
  if (response.output_text) return response.output_text;
  return (response.output || [])
    .flatMap((item) => item.content || [])
    .filter((content) => content.type === "output_text" && content.text)
    .map((content) => content.text)
    .join("\n")
    .trim();
}

function buildAiPrompt({ message, user, intent, ranked, fallback, language }) {
  const profile = user.profile || {};
  const preferredLanguage = languageLabels[language] || profile.preferredLanguage || "English";
  return {
    farmerProfile: {
      state: profile.state || "",
      district: profile.district || "",
      village: profile.village || "",
      landSize: profile.landSize || 0,
      crops: profile.cropType || [],
      incomeCategory: profile.incomeCategory || "Not Specified",
      farmerCategory: profile.farmerCategory || "Not Specified",
      livestock: profile.livestockDetails || [],
      preferredLanguage
    },
    responseLanguage: preferredLanguage,
    languageCode: language || "en",
    detectedIntent: intent,
    matchedSchemes: schemeContext(ranked),
    baselineAnswer: fallback.answer,
    userQuestion: message
  };
}

const farmerAssistantInstructions = [
  "You are KisanBandhu's farmer support assistant.",
  "Answer warmly, clearly, and practically for Indian farmers.",
  "Use the farmer profile and matched government schemes when relevant.",
  "Also help with weather, market prices, crop guidance, disease awareness, livestock care, and seasonal farming when asked.",
  "Do not invent scheme names, eligibility rules, deadlines, application links, market prices, disease outbreaks, or weather alerts.",
  "If the question asks for legal, financial, medical, veterinary, or government certainty, advise checking the official portal, local agriculture office, or veterinarian.",
  "Keep the answer helpful and concise enough for a chat screen.",
  "Always answer in the requested responseLanguage/languageCode from the user payload. Use Hindi for hi, Kannada for kn, and English for en."
].join(" ");

function selectedProvider() {
  const provider = env.aiProvider.toLowerCase();

  if (provider === "groq" && env.groq.apiKey) return "groq";
  if (provider === "xai" && env.xai.apiKey) return "xai";
  if (provider === "openai" && env.openai.apiKey) return "openai";
  if (provider === "auto") {
    if (env.groq.apiKey) return "groq";
    if (env.xai.apiKey) return "xai";
    if (env.openai.apiKey) return "openai";
  }

  return null;
}

async function generateOpenAIAnswer(prompt) {
  if (!env.openai.apiKey) return null;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.openai.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: env.openai.model,
      instructions: farmerAssistantInstructions,
      input: JSON.stringify(prompt),
      max_output_tokens: 700
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI chatbot request failed:", response.status, errorText);
    return null;
  }

  const data = await response.json();
  return extractOpenAIText(data) || null;
}

async function generateXaiAnswer(prompt) {
  if (!env.xai.apiKey) return null;

  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.xai.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: env.xai.model,
      messages: [
        { role: "system", content: farmerAssistantInstructions },
        { role: "user", content: JSON.stringify(prompt) }
      ],
      temperature: 0.3,
      max_tokens: 700
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("xAI chatbot request failed:", response.status, errorText);
    return null;
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
}

async function generateGroqAnswer(prompt) {
  if (!env.groq.apiKey) return null;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.groq.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: env.groq.model,
      messages: [
        { role: "system", content: farmerAssistantInstructions },
        { role: "user", content: JSON.stringify(prompt) }
      ],
      temperature: 0.3,
      max_completion_tokens: 700,
      reasoning_effort: "low",
      include_reasoning: false
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Groq chatbot request failed:", response.status, errorText);
    return null;
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
}

async function generateAiAnswer({ message, user, intent, ranked, fallback, language }) {
  const prompt = buildAiPrompt({ message, user, intent, ranked, fallback, language });
  const provider = selectedProvider();

  if (provider === "groq") return generateGroqAnswer(prompt);
  if (provider === "xai") return generateXaiAnswer(prompt);
  if (provider === "openai") return generateOpenAIAnswer(prompt);
  return null;
}

export async function answerFarmerQuestion({ message, user, language = "en" }) {
  const selectedLanguage = ["en", "hi", "kn"].includes(language) ? language : "en";
  const intent = detectIntent(message);
  const profile = user.profile || {};
  const filter = {
    status: "Published",
    applicationDeadline: { $gte: new Date() }
  };

  if (intent.category) {
    filter.category = intent.category;
  }

  if (profile.state) {
    filter.stateApplicability = { $in: [profile.state, "All India"] };
  }

  let schemes = await Scheme.find(filter).limit(60).sort({ isTrending: -1, createdAt: -1 });

  if (!schemes.length && intent.category) {
    schemes = await Scheme.find({ status: "Published", category: intent.category }).limit(30).sort({ isTrending: -1, createdAt: -1 });
  }

  const ranked = rankSchemesForProfile(schemes, profile);
  const response = buildResponse({ intent, schemes: ranked, profile, language: selectedLanguage });
  const aiAnswer = await generateAiAnswer({ message, user, intent, ranked, fallback: response, language: selectedLanguage });

  return {
    intent,
    answer: aiAnswer || response.answer,
    suggestions: response.suggestions,
    schemes: formatSchemeList(ranked.slice(0, 5)),
    context: {
      profileState: profile.state || "",
      cropType: profile.cropType || [],
      farmerCategory: profile.farmerCategory || "Not Specified"
    }
  };
}
