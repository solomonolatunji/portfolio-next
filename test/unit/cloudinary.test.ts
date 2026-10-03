import { beforeEach, describe, expect, it, vi } from "vitest";

const mockEnv = vi.hoisted(() => ({}) as Record<string, string | undefined>);

vi.mock("~~/env", () => ({ env: mockEnv }));

import {
  isCloudinaryConfigured,
  uploadSignatureToCloudinary,
} from "~~/server/utils/cloudinary";

describe("Cloudinary utility", () => {
  beforeEach(() => {
    for (const key of Object.keys(mockEnv)) {
      delete mockEnv[key];
    }
  });

  it("detects when Cloudinary is not configured", () => {
    expect(isCloudinaryConfigured()).toBe(false);
  });

  it("detects configuration via CLOUDINARY_URL", () => {
    mockEnv.CLOUDINARY_URL = "cloudinary://123456:secret@mycloud";
    expect(isCloudinaryConfigured()).toBe(true);
  });

  it("detects configuration via individual environment variables", () => {
    mockEnv.CLOUDINARY_CLOUD_NAME = "mycloud";
    mockEnv.CLOUDINARY_API_KEY = "123456";
    mockEnv.CLOUDINARY_API_SECRET = "secret";
    expect(isCloudinaryConfigured()).toBe(true);
  });

  it("rejects incomplete individual variables", () => {
    mockEnv.CLOUDINARY_CLOUD_NAME = "mycloud";
    expect(isCloudinaryConfigured()).toBe(false);
  });

  it("throws a descriptive error when trying to upload without configuration", async () => {
    await expect(uploadSignatureToCloudinary("data:image/png;base64,abc")).rejects.toThrow(
      /Cloudinary is not configured/
    );
  });
});
