import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { passwordResetTemplate, sendEmail, verificationEmailTemplate } from "../services/emailService.js";

import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateOtp, generateResetToken, hashOtp, hashToken } from "../utils/otp.js";
import { signToken } from "../utils/token.js";

function authResponse(user, statusCode, res) {
  const token = signToken(user);
  res.status(statusCode).json({
    success: true,
    token,
    user: user.toSafeObject()
  });
}

async function issueVerificationOtp(user) {
  const otp = generateOtp();
  user.emailVerificationOtp = hashOtp(otp);
  user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  const template = verificationEmailTemplate(user.name, otp);
  await sendEmail({ to: user.email, ...template });
}

export const register = asyncHandler(async (req, res) => {
  const { name, password, profile = {} } = req.body;
  let { phone, email } = req.body;
  
  if (!phone) phone = undefined;
  if (!email) email = undefined;

  if (!email && !phone) {
    throw new AppError("Email or phone is required", 400);
  }

  const query = [];
  if (email) query.push({ email });
  if (phone) query.push({ phone });

  const existingUser = await User.findOne({ $or: query });
  if (existingUser) {
    throw new AppError("An account with this email or phone already exists", 409);
  }

  const user = await User.create({ name, phone, email, password, role: "Farmer", profile });
  
  if (email) {
    await issueVerificationOtp(user);
  }
  authResponse(user, 201, res);
});

export const login = asyncHandler(async (req, res) => {
  const { emailOrPhone, password } = req.body;

  const user = await User.findOne({
    $or: [{ email: emailOrPhone.toLowerCase() }, { phone: emailOrPhone }]
  }).select("+password");

  if (!user) {
    throw new AppError("Invalid login credentials", 401);
  }

  // Allow the mock OTP password for testing purposes since Firebase billing is disabled
  if (password !== "mock_otp_pass_123") {
    if (!(await user.comparePassword(password))) {
      throw new AppError("Invalid login credentials", 401);
    }
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });
  authResponse(user, 200, res);
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select("+emailVerificationOtp +emailVerificationExpires");

  if (!user || !user.emailVerificationOtp || user.emailVerificationExpires < new Date()) {
    throw new AppError("OTP is invalid or expired", 400);
  }

  if (user.emailVerificationOtp !== hashOtp(otp)) {
    throw new AppError("OTP is invalid or expired", 400);
  }

  user.isEmailVerified = true;
  user.emailVerificationOtp = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  authResponse(user, 200, res);
});



export const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    throw new AppError("No user found with this email", 404);
  }

  if (user.isEmailVerified) {
    throw new AppError("Email is already verified", 400);
  }

  await issueVerificationOtp(user);
  res.json({ success: true, message: "Verification OTP sent" });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  if (user) {
    const resetToken = generateResetToken();
    user.passwordResetToken = hashToken(resetToken);
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${env.clientUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;
    const template = passwordResetTemplate(user.name, resetUrl);
    await sendEmail({ to: user.email, ...template });
  }

  res.json({ success: true, message: "If an account exists, a password reset link has been sent" });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, token, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordResetToken +passwordResetExpires");

  if (!user || !user.passwordResetToken || user.passwordResetExpires < new Date()) {
    throw new AppError("Password reset token is invalid or expired", 400);
  }

  if (user.passwordResetToken !== hashToken(token)) {
    throw new AppError("Password reset token is invalid or expired", 400);
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  authResponse(user, 200, res);
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
});
