const CATEGORY_WEIGHTS = {
  "DBT schemes": 11,
  "Financial assistance schemes": 10,
  "Crop damage and insurance schemes": 8,
  "Drip and sprinkler subsidies": 7,
  "Irrigation support": 7,
  "Livestock and dairy schemes": 7,
  "Solar panel subsidy schemes": 6,
  "Crop seed purchase schemes": 6,
  "Agriculture schemes": 5,
  "Housing schemes": 4,
  "Water and clean drinking water schemes": 4
};

const INCOME_MATCHES = {
  "Below Poverty Line": ["bpl", "poverty", "vulnerable", "low income", "rural household", "deprivation"],
  "Low Income": ["low income", "small farmer", "marginal", "financial assistance", "income support", "subsidy"],
  "Middle Income": ["subsidy", "insurance", "irrigation", "productivity"],
  "High Income": ["solar", "enterprise", "power generation", "productivity"]
};

const FARMER_CATEGORY_MATCHES = {
  Small: ["small farmer", "small", "income support", "subsidy", "micro-irrigation"],
  Marginal: ["marginal", "small farmer", "income support", "subsidy", "bpl"],
  Medium: ["productivity", "irrigation", "insurance", "solar"],
  Large: ["solar", "power generation", "productivity"],
  Tenant: ["tenant", "sharecropper", "tenancy"],
  "Women Farmer": ["women", "vulnerable", "self help", "livelihood"],
  "SC/ST Farmer": ["sc", "st", "scheduled caste", "scheduled tribe", "vulnerable"]
};

function normalize(value) {
  return String(value || "").toLowerCase();
}

function haystackForScheme(scheme) {
  return normalize([
    scheme.schemeName,
    scheme.description,
    scheme.category,
    scheme.ministryDepartment,
    ...(scheme.benefits || []),
    ...(scheme.eligibilityCriteria || []),
    ...(scheme.requiredDocuments || [])
  ].join(" "));
}

function includesAny(text, terms) {
  return terms.some((term) => text.includes(normalize(term)));
}

function hasLivestock(profile) {
  return (profile.livestockDetails || []).some((item) => Number(item.count || 0) > 0 || item.type);
}

export function getProfileCompleteness(profile) {
  const checks = [
    Boolean(profile.state),
    Number(profile.landSize || 0) > 0,
    Boolean(profile.cropType?.length),
    profile.incomeCategory && profile.incomeCategory !== "Not Specified",
    profile.farmerCategory && profile.farmerCategory !== "Not Specified"
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

function inferFarmerCategory(profile) {
  if (profile.farmerCategory && profile.farmerCategory !== "Not Specified") return profile.farmerCategory;
  const landSize = Number(profile.landSize || 0);
  if (landSize > 0 && landSize < 1) return "Marginal";
  if (landSize >= 1 && landSize < 2) return "Small";
  if (landSize >= 2 && landSize < 10) return "Medium";
  if (landSize >= 10) return "Large";
  return "Not Specified";
}

export function scoreSchemeForProfile(scheme, profile = {}) {
  const text = haystackForScheme(scheme);
  const reasons = [];
  const blockers = [];
  let score = CATEGORY_WEIGHTS[scheme.category] || 4;

  const state = normalize(profile.state);
  const applicableStates = (scheme.stateApplicability || []).map(normalize);
  if (!state) {
    score += 2;
    reasons.push("State is not set, so all broadly applicable schemes are kept visible.");
  } else if (applicableStates.includes("all india") || applicableStates.includes(state)) {
    score += 24;
    reasons.push(`Applicable for ${profile.state}.`);
  } else {
    score -= 30;
    blockers.push(`Scheme is not currently marked for ${profile.state}.`);
  }

  const landSize = Number(profile.landSize || 0);
  if (landSize > 0 && landSize < 2) {
    if (includesAny(text, ["small", "marginal", "income support", "subsidy", "dbt", "bpl"])) {
      score += 18;
      reasons.push("Strong match for small or marginal landholding.");
    }
  } else if (landSize >= 2) {
    if (includesAny(text, ["irrigation", "solar", "insurance", "productivity", "power generation"])) {
      score += 10;
      reasons.push("Useful for larger operational farming needs.");
    }
  }

  const crops = profile.cropType || [];
  crops.forEach((crop) => {
    if (text.includes(normalize(crop))) {
      score += 16;
      reasons.push(`Mentions ${crop}, matching your crop profile.`);
    }
  });

  if (profile.incomeCategory && profile.incomeCategory !== "Not Specified") {
    const terms = INCOME_MATCHES[profile.incomeCategory] || [];
    if (includesAny(text, terms)) {
      score += 12;
      reasons.push(`Matches ${profile.incomeCategory.toLowerCase()} support needs.`);
    }
  }

  const farmerCategory = inferFarmerCategory(profile);
  if (farmerCategory !== "Not Specified") {
    const terms = FARMER_CATEGORY_MATCHES[farmerCategory] || [];
    if (includesAny(text, terms)) {
      score += 12;
      reasons.push(`Aligned with ${farmerCategory.toLowerCase()} farmer category.`);
    }
  }

  if (hasLivestock(profile)) {
    if (scheme.category === "Livestock and dairy schemes" || includesAny(text, ["livestock", "dairy", "animal", "bovine", "veterinary"])) {
      score += 20;
      reasons.push("Matches livestock ownership details.");
    }
  }

  if (scheme.isTrending) {
    score += 5;
    reasons.push("Trending among current farmer services.");
  }

  if (new Date(scheme.applicationDeadline) < new Date()) {
    score -= 45;
    blockers.push("Application deadline appears to have passed.");
  }

  const finalScore = Math.max(0, Math.min(100, Math.round(score)));
  const eligibility = finalScore >= 72 ? "High" : finalScore >= 45 ? "Medium" : "Low";

  return {
    score: finalScore,
    eligibility,
    reasons: reasons.slice(0, 5),
    blockers: blockers.slice(0, 3),
    farmerCategory,
    profileCompleteness: getProfileCompleteness(profile)
  };
}

export function rankSchemesForProfile(schemes, profile) {
  return schemes
    .map((scheme) => {
      const object = scheme.toObject ? scheme.toObject() : scheme;
      return {
        ...object,
        recommendation: scoreSchemeForProfile(object, profile)
      };
    })
    .sort((a, b) => b.recommendation.score - a.recommendation.score);
}
