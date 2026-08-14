import express from "express";
import { body } from "express-validator";
import {
  forgotPassword,
  getMe,
  login,
  register,
  resendOtp,
  resetPassword,
  verifyEmail
} from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

export const authRouter = express.Router();

authRouter.post(
  "/register",
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
    body("phone").optional({ checkFalsy: true }).trim().matches(/^\+?[0-9]{10,15}$/).withMessage("Valid phone number is required"),
    body("email").optional({ checkFalsy: true }).isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
  ],
  validate,
  register
);

authRouter.post(
  "/login",
  [
    body("emailOrPhone").trim().notEmpty().withMessage("Email or phone is required"),
    body("password").notEmpty().withMessage("Password is required")
  ],
  validate,
  login
);

authRouter.post(
  "/verify-email",
  [
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("otp").isLength({ min: 6, max: 6 }).withMessage("Valid OTP is required")
  ],
  validate,
  verifyEmail
);

  authRouter.post(
  "/resend-otp",
  [body("email").isEmail().withMessage("Valid email is required").normalizeEmail()],
  validate,
  resendOtp
);

authRouter.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Valid email is required").normalizeEmail()],
  validate,
  forgotPassword
);

authRouter.post(
  "/reset-password",
  [
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("token").notEmpty().withMessage("Reset token is required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
  ],
  validate,
  resetPassword
);

authRouter.get("/me", authenticate, getMe);
