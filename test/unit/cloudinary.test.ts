import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  configureCloudinary,
  isCloudinaryConfigured,
  uploadSignatureToCloudinary,
} from "../../server/utils/cloudinary";

describe("Cloudinary utility", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.CLOUDINARY_URL;
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("detects when Cloudinary is not configured", () => {
    expect(isCloudinaryConfigured()).toBe(false);
  });

  it("detects configuration via CLOUDINARY_URL", () => {
    process.env.CLOUDINARY_URL = "cloudinary://123456:secret@mycloud";
    expect(isCloudinaryConfigured()).toBe(true);
  });

  it("detects configuration via individual environment variables", () => {
    process.env.CLOUDINARY_CLOUD_NAME = "mycloud";
    process.env.CLOUDINARY_API_KEY = "123456";
    process.env.CLOUDINARY_API_SECRET = "secret";
    expect(isCloudinaryConfigured()).toBe(true);
  });

  it("rejects incomplete individual variables", () => {
    process.env.CLOUDINARY_CLOUD_NAME = "mycloud";
    expect(isCloudinaryConfigured()).toBe(false);
  });

  it("throws a descriptive error when trying to upload without configuration", async () => {
    await expect(uploadSignatureToCloudinary("data:image/png;base64,abc")).rejects.toThrow(
      /Cloudinary is not configured/
    );
  });
});
