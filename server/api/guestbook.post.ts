import { and, count, eq, gt } from "drizzle-orm";
import { getDb } from "#server/db";
import { guestbookEntries } from "#server/db/schema";
import { getGuestbookSession } from "#server/utils/guestbook";
import { isCloudinaryConfigured, uploadSignatureToCloudinary } from "#server/utils/cloudinary";

const MAX_MESSAGE_LENGTH = 500;
const MAX_SIGNATURE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export default defineEventHandler(async (event) => {
  const db = getDb();
  const user = await getGuestbookSession(event);
  if (!user)
    throw createError({
      statusCode: 401,
      statusMessage: "Sign in with GitHub to leave a message.",
    });
  const body = await readBody<{ message?: string; signature?: string }>(event);
  const message = body?.message?.trim() || "";
  if (!message) throw createError({ statusCode: 400, statusMessage: "Write a message first." });
  if (message.length > MAX_MESSAGE_LENGTH)
    throw createError({
      statusCode: 400,
      statusMessage: `Messages must be ${MAX_MESSAGE_LENGTH} characters or fewer.`,
    });
  const [existing] = await db
    .select({ id: guestbookEntries.id })
    .from(guestbookEntries)
    .where(eq(guestbookEntries.userId, user.id))
    .limit(1);

  if (existing) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "You have already signed the guestbook. Each user is entitled to only one entry.",
    });
  }

  let signatureUrl: string | null = null;
  if (body?.signature && typeof body.signature === "string") {
    const rawSignature = body.signature.trim();
    if (rawSignature.startsWith("data:image/")) {
      if (rawSignature.length > MAX_SIGNATURE_SIZE_BYTES) {
        throw createError({
          statusCode: 400,
          statusMessage: "Signature image is too large.",
        });
      }
      if (!isCloudinaryConfigured()) {
        throw createError({
          statusCode: 500,
          statusMessage:
            "Cloudinary is not configured. Please set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment.",
        });
      }
      try {
        signatureUrl = await uploadSignatureToCloudinary(rawSignature);
      } catch (uploadError: unknown) {
        const errorMsg =
          uploadError instanceof Error ? uploadError.message : "Cloudinary upload failed";
        throw createError({
          statusCode: 502,
          statusMessage: `Failed to upload signature: ${errorMsg}`,
        });
      }
    }
  }

  await db.insert(guestbookEntries).values({
    userId: user.id,
    message,
    signatureUrl,
  });
  return { ok: true };
});
