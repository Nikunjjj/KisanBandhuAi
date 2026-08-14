import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyToken } from "../utils/token.js";

export const authenticate = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    throw new AppError("Authentication token is required", 401);
  }

  const payload = verifyToken(token);
  const user = await User.findById(payload.sub);

  if (!user) {
    throw new AppError("User no longer exists", 401);
  }

  req.user = user;
  next();
});

/** For document preview iframes — reads token from Authorization header OR ?token= query param */
export const authenticatePreview = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const token = headerToken || req.query.token || null;

  if (!token) throw new AppError("Authentication required", 401);

  const payload = verifyToken(token);
  const user = await User.findById(payload.sub);
  if (!user) throw new AppError("User no longer exists", 401);

  req.user = user;
  next();
});

export function authorize(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError("You do not have permission to access this resource", 403);
    }
    next();
  };
}
