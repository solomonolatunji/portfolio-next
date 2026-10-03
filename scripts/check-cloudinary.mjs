import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

const {
  CLOUDINARY_URL,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;

console.log("\n--- Checking Cloudinary Environment Variables ---");

const hasUrl = Boolean(CLOUDINARY_URL);
const hasIndividual = Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);

console.log(`• CLOUDINARY_URL:        ${CLOUDINARY_URL ? "SET ✔" : "NOT SET"}`);
console.log(`• CLOUDINARY_CLOUD_NAME: ${CLOUDINARY_CLOUD_NAME || "NOT SET"}`);
console.log(`• CLOUDINARY_API_KEY:    ${CLOUDINARY_API_KEY ? `SET (${CLOUDINARY_API_KEY.slice(0, 4)}...)` : "NOT SET"}`);
console.log(`• CLOUDINARY_API_SECRET: ${CLOUDINARY_API_SECRET ? "SET ✔" : "NOT SET"}`);

if (!hasUrl && !hasIndividual) {
  console.log("\n⚠️ Cloudinary is not configured yet.");
  console.log("To enable guestbook signatures to upload to Cloudinary, provide either:");
  console.log("  Option 1: CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>");
  console.log("  Option 2: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET");
  console.log("\nAdd them to your .env file locally and to your Railway environment variables for production.\n");
  process.exit(0);
}

if (hasUrl) {
  cloudinary.config({ cloudinary_url: CLOUDINARY_URL });
} else {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
}

console.log("\n--- Testing Cloudinary Connection ---");

try {
  const pingResult = await cloudinary.api.ping();
  console.log("✔ Cloudinary API Ping:", pingResult.status);
  console.log("\n🎉 Cloudinary credentials are valid and ready for signature uploads!\n");
} catch (err) {
  console.error("\n❌ Cloudinary Connection Error:", err.message);
  process.exit(1);
}
