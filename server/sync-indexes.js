import mongoose from "mongoose";
import { env } from "./src/config/env.js";
import { User } from "./src/models/User.js";

async function run() {
  await mongoose.connect(env.mongoUri);
  console.log("Connected to MongoDB");
  
  try {
    await User.collection.dropIndex("email_1");
    console.log("Dropped email_1 index");
  } catch (e) {
    console.log("email_1 index not found or already dropped");
  }

  try {
    await User.collection.dropIndex("phone_1");
    console.log("Dropped phone_1 index");
  } catch (e) {
    console.log("phone_1 index not found or already dropped");
  }

  await User.syncIndexes();
  console.log("Synced all indexes with Mongoose schema (sparse applied).");

  process.exit(0);
}

run().catch(console.error);
