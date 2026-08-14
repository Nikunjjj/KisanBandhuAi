import nodemailer from "nodemailer";
import { env } from "../config/env.js";

function hasEmailConfig() {
  return env.email.host && env.email.user && env.email.pass;
}

export async function sendEmail({ to, subject, text, html }) {
  if (!hasEmailConfig()) {
    console.log("Email config missing. Development email:", { to, subject, text });
    return;
  }

  const transporter = nodemailer.createTransport({
    host: env.email.host,
    port: env.email.port,
    secure: env.email.port === 465,
    auth: {
      user: env.email.user,
      pass: env.email.pass
    }
  });

  await transporter.sendMail({
    from: env.email.from,
    to,
    subject,
    text,
    html
  });
}

export function verificationEmailTemplate(name, otp) {
  return {
    subject: "Verify your KisanBandhu account",
    text: `Namaste ${name}, your KisanBandhu verification OTP is ${otp}. It expires in 10 minutes.`,
    html: `<p>Namaste ${name},</p><p>Your KisanBandhu verification OTP is <strong>${otp}</strong>.</p><p>This OTP expires in 10 minutes.</p>`
  };
}

export function passwordResetTemplate(name, resetUrl) {
  return {
    subject: "Reset your KisanBandhu password",
    text: `Namaste ${name}, reset your password using this link: ${resetUrl}`,
    html: `<p>Namaste ${name},</p><p>Reset your password using this secure link:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
  };
}
