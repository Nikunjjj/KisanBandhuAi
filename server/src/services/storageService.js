import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

export async function uploadToStorage({ dataUri, folder = "krishimitra/community", resourceType = "auto" }) {
  if (!env.cloudinary.cloudName || !env.cloudinary.apiKey || !env.cloudinary.apiSecret) {
    throw new AppError("Cloudinary storage is not configured", 503);
  }

  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret
  });

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: resourceType
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    type: result.resource_type
  };
}
