export function getProfileCompleteness(profile = {}) {
  const checks = [
    Boolean(profile.state),
    Number(profile.landSize || 0) > 0,
    Boolean(profile.cropType?.length),
    profile.incomeCategory && profile.incomeCategory !== "Not Specified",
    profile.farmerCategory && profile.farmerCategory !== "Not Specified"
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function buildDashboardFromRecommendations(recommendations, profile, weatherAlerts = 0) {
  const profileScore = getProfileCompleteness(profile);
  const crops = profile.cropType || [];
  const cropAdvisories = Math.max(crops.length * 2 + 4, crops.length > 0 ? 7 : 0);

  const eligibleSchemes = recommendations.filter((scheme) =>
    ["High", "Medium"].includes(scheme.recommendation?.eligibility)
  ).length;

  const dbtPrograms = recommendations.filter(
    (scheme) => scheme.category === "DBT schemes" && (scheme.recommendation?.score || 0) >= 45
  ).length;

  const dbtSchemes = recommendations.filter((scheme) => scheme.category === "DBT schemes");
  const dbtReadiness = dbtSchemes.length
    ? Math.round(dbtSchemes.reduce((sum, scheme) => sum + (scheme.recommendation?.score || 0), 0) / dbtSchemes.length)
    : 0;

  const schemeReadiness = recommendations.length
    ? Math.round(
        recommendations.slice(0, 10).reduce((sum, scheme) => sum + (scheme.recommendation?.score || 0), 0) /
          Math.min(10, recommendations.length)
      )
    : 0;

  let advisoryReadiness = 0;
  if (profile.state || profile.district) advisoryReadiness += 25;
  if (crops.length) advisoryReadiness += Math.min(50, crops.length * 25);
  if ((profile.livestockDetails || []).some((item) => Number(item.count || 0) > 0 || item.type)) {
    advisoryReadiness += 25;
  }
  advisoryReadiness = Math.min(100, advisoryReadiness);

  return {
    stats: {
      eligibleSchemes,
      dbtPrograms,
      cropAdvisories,
      weatherAlerts
    },
    readiness: [
      { name: "Profile", value: profileScore },
      { name: "DBT", value: dbtReadiness },
      { name: "Schemes", value: schemeReadiness },
      { name: "Advisory", value: advisoryReadiness }
    ],
    profileCompleteness: profileScore,
    topRecommendations: recommendations.slice(0, 3).map((scheme) => ({
      _id: scheme._id,
      schemeName: scheme.schemeName,
      category: scheme.category,
      score: scheme.recommendation?.score || 0,
      eligibility: scheme.recommendation?.eligibility || "Low"
    }))
  };
}
