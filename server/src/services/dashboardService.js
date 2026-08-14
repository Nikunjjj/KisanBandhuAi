import { Scheme } from "../models/Scheme.js";
import {
  getCropKnowledge,
  getSeasonalRecommendations,
  getWeatherIntelligence
} from "./agricultureService.js";
import { getProfileCompleteness, rankSchemesForProfile } from "./recommendationService.js";

function normalize(value) {
  return String(value || "").toLowerCase();
}

function cropMatchesProfile(cropName, profileCrops) {
  const name = normalize(cropName);
  return profileCrops.some((crop) => {
    const profileCrop = normalize(crop);
    return name.includes(profileCrop) || profileCrop.includes(name);
  });
}

function computeAdvisoryReadiness(profile, cropGuides, profileCrops) {
  let score = 0;

  if (profile.state || profile.district) score += 25;
  if (profileCrops.length) {
    const matched = cropGuides.filter((crop) => cropMatchesProfile(crop.cropName, profileCrops)).length;
    score += Math.min(50, matched * 25);
  }
  if ((profile.livestockDetails || []).some((item) => Number(item.count || 0) > 0 || item.type)) {
    score += 25;
  }

  return Math.min(100, score);
}

export async function getDashboardSummary(user) {
  const profile = user.profile || {};
  const profileCrops = profile.cropType || [];

  const filter = {
    status: "Published",
    applicationDeadline: { $gte: new Date() }
  };

  if (profile.state) {
    filter.stateApplicability = { $in: [profile.state, "All India"] };
  }

  const schemes = await Scheme.find(filter).limit(100).sort({ isTrending: -1, createdAt: -1 });
  const ranked = rankSchemesForProfile(schemes, profile);

  const eligibleSchemes = ranked.filter((scheme) =>
    ["High", "Medium"].includes(scheme.recommendation?.eligibility)
  ).length;

  const dbtPrograms = ranked.filter(
    (scheme) => scheme.category === "DBT schemes" && scheme.recommendation?.score >= 45
  ).length;

  const { crops: cropGuides } = getCropKnowledge({});
  const matchedCropGuides = profileCrops.length
    ? cropGuides.filter((crop) => cropMatchesProfile(crop.cropName, profileCrops))
    : [];

  const seasonal = getSeasonalRecommendations({
    region: profile.district || profile.state,
    cropType: profileCrops.join(", ")
  });

  const cropAdvisories =
    matchedCropGuides.length + (seasonal.recommendations?.length || 0) + (seasonal.activities?.length || 0);

  const district = profile.district || "Bengaluru Rural";
  const weather = await getWeatherIntelligence({ district });
  const weatherAlerts = weather.alerts?.length || 0;

  const profileScore = getProfileCompleteness(profile);

  const dbtSchemes = ranked.filter((scheme) => scheme.category === "DBT schemes");
  const dbtReadiness = dbtSchemes.length
    ? Math.round(dbtSchemes.reduce((sum, scheme) => sum + scheme.recommendation.score, 0) / dbtSchemes.length)
    : 0;

  const schemeReadiness = ranked.length
    ? Math.round(
        ranked.slice(0, 10).reduce((sum, scheme) => sum + scheme.recommendation.score, 0) /
          Math.min(10, ranked.length)
      )
    : 0;

  const advisoryReadiness = computeAdvisoryReadiness(profile, cropGuides, profileCrops);

  return {
    stats: {
      eligibleSchemes,
      dbtPrograms,
      cropAdvisories,
      weatherAlerts,
      bookmarkedSchemes: user.bookmarkedSchemes?.length || 0,
      openSchemes: schemes.length
    },
    readiness: [
      { name: "Profile", value: profileScore },
      { name: "DBT", value: dbtReadiness },
      { name: "Schemes", value: schemeReadiness },
      { name: "Advisory", value: advisoryReadiness }
    ],
    profileCompleteness: profileScore,
    topRecommendations: ranked.slice(0, 3).map((scheme) => ({
      _id: scheme._id,
      schemeName: scheme.schemeName,
      category: scheme.category,
      score: scheme.recommendation.score,
      eligibility: scheme.recommendation.eligibility
    }))
  };
}
