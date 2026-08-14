import mongoose from "mongoose";
import { SCHEME_CATEGORIES } from "../constants/schemeConstants.js";
import { Scheme } from "../models/Scheme.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

function buildSchemePayload(body, userId) {
  return {
    schemeName: body.schemeName,
    description: body.description,
    benefits: normalizeArray(body.benefits),
    eligibilityCriteria: normalizeArray(body.eligibilityCriteria),
    requiredDocuments: normalizeArray(body.requiredDocuments),
    applicationDeadline: body.applicationDeadline,
    stateApplicability: normalizeArray(body.stateApplicability),
    ministryDepartment: body.ministryDepartment,
    applicationLink: body.applicationLink,
    category: body.category,
    isTrending: Boolean(body.isTrending),
    status: body.status || "Published",
    updatedBy: userId
  };
}

function withBookmarkFlag(scheme, user) {
  const object = scheme.toObject ? scheme.toObject() : scheme;
  const id = object._id.toString();
  const bookmarks = user?.bookmarkedSchemes?.map((schemeId) => schemeId.toString()) || [];
  return {
    ...object,
    isBookmarked: bookmarks.includes(id)
  };
}

export const getSchemeMeta = asyncHandler(async (_req, res) => {
  const [states, ministries] = await Promise.all([
    Scheme.distinct("stateApplicability", { status: "Published" }),
    Scheme.distinct("ministryDepartment", { status: "Published" })
  ]);

  res.json({
    success: true,
    categories: SCHEME_CATEGORIES,
    states: states.filter(Boolean).sort(),
    ministries: ministries.filter(Boolean).sort()
  });
});

export const listSchemes = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    state,
    ministry,
    trending,
    latest,
    status,
    deadline,
    page = 1,
    limit = 12
  } = req.query;

  const filter = {};
  const isAdmin = req.user?.role === "Admin";

  if (isAdmin && status) {
    filter.status = status;
  } else {
    filter.status = "Published";
  }

  if (search) filter.$text = { $search: search };
  if (category) filter.category = category;
  if (state) filter.stateApplicability = { $in: [state, "All India"] };
  if (ministry) filter.ministryDepartment = ministry;
  if (trending === "true") filter.isTrending = true;
  if (deadline === "open") filter.applicationDeadline = { $gte: new Date() };

  const pageNumber = Math.max(Number(page), 1);
  const pageSize = Math.min(Math.max(Number(limit), 1), 50);
  const skip = (pageNumber - 1) * pageSize;
  const sort = latest === "true" ? { createdAt: -1 } : search ? { score: { $meta: "textScore" } } : { isTrending: -1, createdAt: -1 };
  const projection = search ? { score: { $meta: "textScore" } } : {};

  const [schemes, total] = await Promise.all([
    Scheme.find(filter, projection).sort(sort).skip(skip).limit(pageSize),
    Scheme.countDocuments(filter)
  ]);

  res.json({
    success: true,
    schemes: schemes.map((scheme) => withBookmarkFlag(scheme, req.user)),
    pagination: {
      page: pageNumber,
      limit: pageSize,
      total,
      pages: Math.ceil(total / pageSize)
    }
  });
});

export const getSchemeById = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new AppError("Invalid scheme id", 400);
  }

  const scheme = await Scheme.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });

  if (!scheme || (scheme.status !== "Published" && req.user?.role !== "Admin")) {
    throw new AppError("Scheme not found", 404);
  }

  res.json({ success: true, scheme: withBookmarkFlag(scheme, req.user) });
});

export const createScheme = asyncHandler(async (req, res) => {
  const payload = buildSchemePayload(req.body, req.user._id);
  const scheme = await Scheme.create({ ...payload, createdBy: req.user._id });

  res.status(201).json({
    success: true,
    message: "Scheme created successfully",
    scheme
  });
});

export const updateScheme = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new AppError("Invalid scheme id", 400);
  }

  const payload = buildSchemePayload(req.body, req.user._id);
  const scheme = await Scheme.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  });

  if (!scheme) {
    throw new AppError("Scheme not found", 404);
  }

  res.json({
    success: true,
    message: "Scheme updated successfully",
    scheme
  });
});

export const deleteScheme = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new AppError("Invalid scheme id", 400);
  }

  const scheme = await Scheme.findByIdAndDelete(req.params.id);

  if (!scheme) {
    throw new AppError("Scheme not found", 404);
  }

  res.json({ success: true, message: "Scheme deleted successfully" });
});

export const toggleBookmark = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new AppError("Invalid scheme id", 400);
  }

  const scheme = await Scheme.findById(req.params.id);
  if (!scheme || scheme.status !== "Published") {
    throw new AppError("Scheme not found", 404);
  }

  const schemeId = scheme._id.toString();
  const bookmarks = req.user.bookmarkedSchemes.map((id) => id.toString());
  const isBookmarked = bookmarks.includes(schemeId);

  if (isBookmarked) {
    req.user.bookmarkedSchemes = req.user.bookmarkedSchemes.filter((id) => id.toString() !== schemeId);
  } else {
    req.user.bookmarkedSchemes.push(scheme._id);
  }

  await req.user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    isBookmarked: !isBookmarked,
    bookmarkedSchemes: req.user.bookmarkedSchemes
  });
});

export const getBookmarkedSchemes = asyncHandler(async (req, res) => {
  const user = await req.user.populate({
    path: "bookmarkedSchemes",
    match: { status: "Published" },
    options: { sort: { createdAt: -1 } }
  });

  res.json({
    success: true,
    schemes: user.bookmarkedSchemes.map((scheme) => withBookmarkFlag(scheme, req.user))
  });
});
