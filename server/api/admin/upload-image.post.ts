import { readBody, readMultipartFormData } from "h3";
import { requireAdmin } from "#server/utils/admin";
import { uploadBlogImageToCloudinary } from "#server/utils/cloudinary";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const contentType = getHeader(event, "content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await readMultipartFormData(event);
    if (!formData || formData.length === 0) {
      throw createError({ statusCode: 400, statusMessage: "No file uploaded." });
    }

    const fileField = formData.find((f) => f.name === "file" || f.name === "image");
    if (!fileField || !fileField.data) {
      throw createError({ statusCode: 400, statusMessage: "Image file field missing." });
    }

    const mime = fileField.type || "image/png";
    const base64 = fileField.data.toString("base64");
    const dataUri = `data:${mime};base64,${base64}`;

    const uploaded = await uploadBlogImageToCloudinary(dataUri);
    return uploaded;
  }

  // Handle JSON base64 data URI
  const body = await readBody<{ image?: string; folder?: string }>(event);
  if (!body?.image || !body.image.startsWith("data:image/")) {
    throw createError({
      statusCode: 400,
      statusMessage: "Please provide a valid image data URI.",
    });
  }

  const uploaded = await uploadBlogImageToCloudinary(body.image, body.folder || "portfolio/blog");
  return uploaded;
});
