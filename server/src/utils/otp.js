import crypto from "crypto";

export function generateOtp() {
  return String(crypto.randomInt(100000, 999999));
}

export function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export function generateResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
