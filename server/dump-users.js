import mongoose from "mongoose";
import { env } from "./src/config/env.js";
import { User } from "./src/models/User.js";

async function run() {
  await mongoose.connect(env.mongoUri);
  const users = await User.find({}, "name phone email");
  console.log(users);
  process.exit(0);
}
run().catch(console.error);
