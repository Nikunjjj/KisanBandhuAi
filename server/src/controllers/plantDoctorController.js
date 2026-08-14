import { analyzePlantImage } from "../services/plantDoctorService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// POST /api/plant-doctor/analyze
export const analyzePlant = asyncHandler(async (req, res) => {
  const { imageBase64, mimeType } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ success: false, message: "Image data is required." });
  }

  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const type = mimeType || "image/jpeg";
  if (!allowedTypes.includes(type)) {
    return res.status(400).json({ success: false, message: "Only JPEG, PNG, and WebP images are supported." });
  }

  // Rough size guard — base64 of 10MB is ~13.3M chars
  if (imageBase64.length > 14_000_000) {
    return res.status(400).json({ success: false, message: "Image is too large. Please use an image under 10 MB." });
  }

  const diagnosis = await analyzePlantImage({ imageBase64, mimeType: type });

  res.json({ success: true, diagnosis });
});
