// scripts/check-cloudinary.ts
//
// Simple health check for Cloudinary credentials and connectivity.
// Run this script with `ts-node` after installing the `cloudinary` package
// (`npm install cloudinary`) and setting the environment variables
// CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.

import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function main() {
  try {
    const res = await cloudinary.api.ping();
    console.log("Cloudinary OK:", res);
  } catch (err) {
    console.error("Cloudinary ERROR:");
    console.error(err);
  }
}

main().catch((err) => {
  console.error("Unexpected error running Cloudinary check:", err);
});