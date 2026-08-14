import mongoose from "mongoose";
import { Scheme } from "../models/Scheme.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { rankSchemesForProfile, scoreSchemeForProfile } from "../services/recommendationService.js";

function withBookmarkFlag(scheme, user) {
  const id = scheme._id.toString();
  const bookmarks = user?.bookmarkedSchemes?.map((schemeId) => schemeId.toString()) || [];
  return {
    ...scheme,
    isBookmarked: bookmarks.includes(id)
  };
}

export const getRecommendations = asyncHandler(async (req, res) => {
  const { limit = 8 } = req.query;
  const profile = req.user.profile || {};

  const filter = {
    status: "Published",
    applicationDeadline: { $gte: new Date() }
  };

  if (profile.state) {
    filter.stateApplicability = { $in: [profile.state, "All India"] };
  }

  const schemes = await Scheme.find(filter).limit(100).sort({ isTrending: -1, createdAt: -1 });
  const ranked = rankSchemesForProfile(schemes, profile).slice(0, Math.min(Number(limit), 30));

  res.json({
    success: true,
    profileSummary: {
      state: profile.state || "",
      landSize: profile.landSize || 0,
      cropType: profile.cropType || [],
      incomeCategory: profile.incomeCategory || "Not Specified",
      farmerCategory: ranked[0]?.recommendation?.farmerCategory || profile.farmerCategory || "Not Specified",
      profileCompleteness: ranked[0]?.recommendation?.profileCompleteness || 0
    },
    recommendations: ranked.map((scheme) => withBookmarkFlag(scheme, req.user))
  });
});

export const checkSchemeEligibility = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.schemeId)) {
    throw new AppError("Invalid scheme id", 400);
  }

  const scheme = await Scheme.findById(req.params.schemeId);
  if (!scheme || scheme.status !== "Published") {
    throw new AppError("Scheme not found", 404);
  }

  const result = scoreSchemeForProfile(scheme, req.user.profile || {});

  res.json({
    success: true,
    scheme: withBookmarkFlag(scheme.toObject(), req.user),
    eligibility: result
  });
});
