import { Document, DOCUMENT_TYPES } from "../models/Document.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { env } from "../config/env.js";
import { v2 as cloudinary } from "cloudinary";

const DOCUMENT_LABELS = {
  aadhaar: "Aadhaar Card",
  land_ownership: "Land Ownership Document",
  income_certificate: "Income Certificate",
  farmer_verification: "Farmer Verification Document"
};

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];

/**
 * Optionally upload to Cloudinary if credentials exist.
 * Falls back to base64 in MongoDB.
 */
async function storeDocument(dataUri, type) {
  const { cloudName, apiKey, apiSecret } = env.cloudinary;
  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: `kisanbandhu/documents/${type}`,
      resource_type: "auto"
    });
    return { cloudinaryUrl: result.secure_url, cloudinaryPublicId: result.public_id, dataUri: null };
  }
  return { cloudinaryUrl: "", cloudinaryPublicId: "", dataUri };
}

// POST /api/documents/upload
export const uploadDocument = asyncHandler(async (req, res) => {
  const { type, fileName, mimeType, dataUri } = req.body;

  if (!type || !DOCUMENT_TYPES.includes(type)) {
    throw new AppError(`Invalid document type. Allowed: ${DOCUMENT_TYPES.join(", ")}`, 400);
  }
  if (!dataUri || !fileName || !mimeType) {
    throw new AppError("fileName, mimeType and dataUri are required", 400);
  }
  if (!ALLOWED_MIME.includes(mimeType)) {
    throw new AppError("Only JPEG, PNG and PDF files are accepted", 400);
  }

  // Estimate size from base64 string (~75% of byte length)
  const base64Data = dataUri.includes(",") ? dataUri.split(",")[1] : dataUri;
  const estimatedBytes = Math.ceil((base64Data.length * 3) / 4);
  if (estimatedBytes > MAX_SIZE_BYTES) {
    throw new AppError("File size must be 5 MB or less", 400);
  }

  const stored = await storeDocument(dataUri, type);

  // Upsert — replace any previous active document of the same type for this user
  const doc = await Document.findOneAndUpdate(
    { userId: req.user._id, type, isDeleted: false },
    {
      $set: {
        label: DOCUMENT_LABELS[type],
        fileName,
        mimeType,
        size: estimatedBytes,
        verificationStatus: "pending",
        verificationNote: "",
        verifiedAt: null,
        verifiedBy: "",
        ...stored
      }
    },
    { upsert: true, new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Document uploaded successfully",
    document: {
      _id: doc._id,
      type: doc.type,
      label: doc.label,
      fileName: doc.fileName,
      mimeType: doc.mimeType,
      size: doc.size,
      verificationStatus: doc.verificationStatus,
      hasCloudinaryUrl: Boolean(doc.cloudinaryUrl),
      uploadedAt: doc.updatedAt
    }
  });
});

// GET /api/documents
export const listDocuments = asyncHandler(async (req, res) => {
  const docs = await Document.find({ userId: req.user._id, isDeleted: false }).select("-dataUri -__v").sort({ updatedAt: -1 }).lean();

  // Return all types with meta even if not uploaded yet
  const docMap = {};
  for (const d of docs) docMap[d.type] = d;

  const allTypes = DOCUMENT_TYPES.map((type) => ({
    type,
    label: DOCUMENT_LABELS[type],
    uploaded: Boolean(docMap[type]),
    ...(docMap[type] || {})
  }));

  res.json({ success: true, documents: allTypes });
});

// GET /api/documents/:id/preview
export const getDocumentPreview = asyncHandler(async (req, res) => {
  const doc = await Document.findOne({
    _id: req.params.id,
    userId: req.user._id,
    isDeleted: false
  }).select("+dataUri");

  if (!doc) throw new AppError("Document not found", 404);

  // If stored in Cloudinary, redirect
  if (doc.cloudinaryUrl) {
    return res.redirect(doc.cloudinaryUrl);
  }

  // Serve from base64
  if (!doc.dataUri) throw new AppError("Document data is not available", 404);

  const base64 = doc.dataUri.includes(",") ? doc.dataUri.split(",")[1] : doc.dataUri;
  const buffer = Buffer.from(base64, "base64");

  res.set("Content-Type", doc.mimeType);
  res.set("Content-Disposition", `inline; filename="${doc.fileName}"`);
  res.set("Content-Length", buffer.length);
  res.send(buffer);
});

// DELETE /api/documents/:id
export const deleteDocument = asyncHandler(async (req, res) => {
  const doc = await Document.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  );
  if (!doc) throw new AppError("Document not found", 404);

  // Optionally delete from Cloudinary
  if (doc.cloudinaryPublicId && env.cloudinary.apiKey) {
    cloudinary.config({
      cloud_name: env.cloudinary.cloudName,
      api_key: env.cloudinary.apiKey,
      api_secret: env.cloudinary.apiSecret
    });
    await cloudinary.uploader.destroy(doc.cloudinaryPublicId).catch(() => {});
  }

  res.json({ success: true, message: "Document deleted" });
});
