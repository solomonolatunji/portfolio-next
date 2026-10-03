import { v2 as cloudinary } from "cloudinary";
import { env } from "~~/env";

export function isCloudinaryConfigured(): boolean {
  if (env.CLOUDINARY_URL) {
    return true;
  }
  return Boolean(
    env.CLOUDINARY_CLOUD_NAME &&
      env.CLOUDINARY_API_KEY &&
      env.CLOUDINARY_API_SECRET
  );
}

export function configureCloudinary(): void {
  const url = env.CLOUDINARY_URL;
  if (url) {
    cloudinary.config({
      cloudinary_url: url,
    });
  } else if (
    env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET
  ) {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    });
  }
}

export async function uploadSignatureToCloudinary(dataUri: string): Promise<string> {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary is not configured. Please set CLOUDINARY_URL or (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)."
    );
  }

  configureCloudinary();

  const response = await cloudinary.uploader.upload(dataUri, {
    folder: "portfolio/signatures",
    resource_type: "image",
    format: "png",
  });

  return response.secure_url;
}

export async function uploadBlogImageToCloudinary(
  dataUri: string,
  folder = "portfolio/blog"
): Promise<{ url: string; publicId: string }> {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary is not configured. Please set CLOUDINARY_URL or (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)."
    );
  }

  configureCloudinary();

  const response = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
  });

  return {
    url: response.secure_url,
    publicId: response.public_id,
  };
}
