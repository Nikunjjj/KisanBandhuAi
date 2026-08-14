import { connectDb } from "../config/db.js";
import { validateEnv } from "../config/env.js";
import { User } from "../models/User.js";

function readArg(name, fallback) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((item) => item.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : fallback;
}

async function createAdmin() {
  validateEnv();

  const name = readArg("name", process.env.ADMIN_NAME);
  const email = readArg("email", process.env.ADMIN_EMAIL);
  const phone = readArg("phone", process.env.ADMIN_PHONE);
  const password = readArg("password", process.env.ADMIN_PASSWORD);

  if (!name || !email || !phone || !password) {
    throw new Error("Provide --name, --email, --phone, and --password or set ADMIN_NAME, ADMIN_EMAIL, ADMIN_PHONE, and ADMIN_PASSWORD");
  }

  await connectDb();

  const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { phone }] });

  if (existingUser) {
    existingUser.role = "Admin";
    existingUser.isEmailVerified = true;
    if (password) existingUser.password = password;
    await existingUser.save();
    console.log(`Updated existing user ${email} as Admin`);
    process.exit(0);
  }

  await User.create({
    name,
    email,
    phone,
    password,
    role: "Admin",
    isEmailVerified: true,
    profile: { preferredLanguage: "English" }
  });

  console.log(`Created Admin user ${email}`);
  process.exit(0);
}

createAdmin().catch((error) => {
  console.error("Failed to create admin:", error.message);
  process.exit(1);
});
