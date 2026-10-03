import { nextTick, type Ref } from "vue";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function wrapMarkdownSelection(
  textarea: HTMLTextAreaElement | null,
  contentRef: Ref<string>,
  prefix: string,
  suffix = "",
  defaultText = "text"
) {
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const currentVal = contentRef.value;

  const selectedText = currentVal.substring(start, end) || defaultText;
  const replacement = `${prefix}${selectedText}${suffix}`;

  contentRef.value = currentVal.substring(0, start) + replacement + currentVal.substring(end);

  nextTick(() => {
    textarea.focus();
    const newCursor = start + prefix.length + selectedText.length;
    textarea.setSelectionRange(start + prefix.length, newCursor);
  });
}

export function insertMarkdownLinePrefix(
  textarea: HTMLTextAreaElement | null,
  contentRef: Ref<string>,
  prefix: string
) {
  if (!textarea) return;

  const start = textarea.selectionStart;
  const currentVal = contentRef.value;

  const lastNewline = currentVal.lastIndexOf("\n", start - 1);
  const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;

  contentRef.value = currentVal.substring(0, lineStart) + prefix + currentVal.substring(lineStart);

  nextTick(() => {
    textarea.focus();
    textarea.setSelectionRange(start + prefix.length, start + prefix.length);
  });
}

export async function uploadImageToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await $fetch<{ url: string; secure_url?: string }>("/api/admin/upload-image", {
    method: "POST",
    body: formData,
  });

  return res.secure_url || res.url;
}
