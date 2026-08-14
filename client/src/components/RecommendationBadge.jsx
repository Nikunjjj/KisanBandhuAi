import React from "react";
import { useTranslation } from "react-i18next";

export default function RecommendationBadge({ recommendation }) {
  const { t } = useTranslation("schemes");
  if (!recommendation) return null;

  const styles = {
    High: "bg-green-100 text-leaf",
    Medium: "bg-yellow-100 text-yellow-800",
    Low: "bg-red-50 text-red-700"
  };

  return (
    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold ${styles[recommendation.eligibility] || styles.Low}`}>
      {recommendation.score}% {t("match", "match")} · {t(`eligibilityLevels.${recommendation.eligibility}`, recommendation.eligibility)}
    </span>
  );
}
