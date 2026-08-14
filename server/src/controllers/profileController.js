import { asyncHandler } from "../utils/asyncHandler.js";

export const getProfile = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    profile: req.user.profile,
    user: req.user.toSafeObject()
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  ["profileImage", "bio", "farmingExperience"].forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      req.user[field] = req.body[field];
    }
  });

  const allowedFields = [
    "state",
    "district",
    "village",
    "landSize",
    "cropType",
    "incomeCategory",
    "farmerCategory",
    "livestockDetails",
    "preferredLanguage"
  ];

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      req.user.profile[field] = req.body[field];
    }
  });

  await req.user.save();

  res.json({
    success: true,
    message: "Profile updated successfully",
    user: req.user.toSafeObject()
  });
});
