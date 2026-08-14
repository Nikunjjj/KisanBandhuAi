import mongoose from "mongoose";
import { env } from "./src/config/env.js";
import { User } from "./src/models/User.js";

async function run() {
  await mongoose.connect(env.mongoUri);
  const users = await User.find({ $or: [{phone: "7978670850"}, {phone: "+917978670850"}] }, "name phone email");
  console.log("Found:", users);
  process.exit(0);
}
run().catch(console.error);
