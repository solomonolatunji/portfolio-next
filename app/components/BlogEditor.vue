<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import type { BlogPost } from "@/interfaces/blog";
import { renderMarkdown } from "@/utils/markdown";

interface Props {
  post?: BlogPost | null;
  isNew?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  post: null,
  isNew: false,
});

const router = useRouter();

const title = ref(props.post?.title || "");
const slug = ref(props.post?.slug || "");
const slugManual = ref(!props.isNew && Boolean(props.post?.slug));
const description = ref(props.post?.description || "");
const content = ref(props.post?.content || "");
const featuredImageUrl = ref(props.post?.featuredImageUrl || "");
const published = ref(props.post ? Boolean(props.post.published) : false);
const allowComments = ref(props.post ? Boolean(props.post.allowComments) : true);

// Editor state
const activeTab = ref<"write" | "preview" | "split">("write");
const isSubmitting = ref(false);
const isUploadingFeatured = ref(false);
const isUploadingInline = ref(false);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);

const textareaRef = ref<HTMLTextAreaElement | null>(null);
const featuredFileInput = ref<HTMLInputElement | null>(null);
const inlineFileInput = ref<HTMLInputElement | null>(null);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function onTitleInput() {
  if (!slugManual.value) {
    slug.value = slugify(title.value);
  }
}

function onSlugInput() {
  slugManual.value = true;
  slug.value = slugify(slug.value);
}

function resetSlugToTitle() {
  slugManual.value = false;
  slug.value = slugify(title.value);
}

const renderedPreview = computed(() => {
  return renderMarkdown(content.value || "*Nothing to preview yet.*");
});

// Markdown formatting helper
function wrapSelection(prefix: string, suffix = "", defaultText = "text") {
  const textarea = textareaRef.value;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const currentVal = content.value;

  const selectedText = currentVal.substring(start, end) || defaultText;
  const replacement = `${prefix}${selectedText}${suffix}`;

  content.value =
    currentVal.substring(0, start) + replacement + currentVal.substring(end);

  nextTick(() => {
    textarea.focus();
    const newCursor = start + prefix.length + selectedText.length;
    textarea.setSelectionRange(start + prefix.length, newCursor);
  });
}

function insertLinePrefix(prefix: string) {
  const textarea = textareaRef.value;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const currentVal = content.value;

  // Find start of current line
  const lastNewline = currentVal.lastIndexOf("\n", start - 1);
  const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;

  content.value =
    currentVal.substring(0, lineStart) +
    prefix +
    currentVal.substring(lineStart);

  nextTick(() => {
    textarea.focus();
    textarea.setSelectionRange(start + prefix.length, start + prefix.length);
  });
}

// Image upload handling
async function uploadImageFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await $fetch<{ url: string; secure_url?: string }>("/api/admin/upload-image", {
    method: "POST",
    body: formData,
  });

  return res.secure_url || res.url;
}

async function handleFeaturedUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  isUploadingFeatured.value = true;
  errorMessage.value = null;

  try {
    const url = await uploadImageFile(file);
    featuredImageUrl.value = url;
  } catch (err: any) {
    errorMessage.value = err?.data?.message || err?.message || "Failed to upload featured image.";
  } finally {
    isUploadingFeatured.value = false;
    if (featuredFileInput.value) {
      featuredFileInput.value.value = "";
    }
  }
}

function removeFeaturedImage() {
  featuredImageUrl.value = "";
}

async function handleInlineUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  isUploadingInline.value = true;
  errorMessage.value = null;

  try {
    const url = await uploadImageFile(file);
    const alt = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    wrapSelection(`![${alt}](`, `${url})`, "");
  } catch (err: any) {
    errorMessage.value = err?.data?.message || err?.message || "Failed to upload inline image.";
  } finally {
    isUploadingInline.value = false;
    if (inlineFileInput.value) {
      inlineFileInput.value.value = "";
    }
  }
}

async function savePost(publishState?: boolean) {
  if (publishState !== undefined) {
    published.value = publishState;
  }

  if (!title.value.trim()) {
    errorMessage.value = "Title is required.";
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = null;
  successMessage.value = null;

  const payload = {
    title: title.value.trim(),
    slug: slug.value.trim() || slugify(title.value),
    description: description.value.trim(),
    content: content.value,
    featuredImageUrl: featuredImageUrl.value.trim() || null,
    published: published.value,
    allowComments: allowComments.value,
  };

  try {
    if (props.isNew) {
      const res = await $fetch<{ id: number; slug: string }>("/api/admin/posts", {
        method: "POST",
        body: payload,
      });
      successMessage.value = "Article created successfully!";
      router.push(`/admin/blog`);
    } else if (props.post) {
      await $fetch<{ ok: boolean }>(`/api/admin/posts/${props.post.id}`, {
        method: "PUT",
        body: payload,
      });
      successMessage.value = "Article updated successfully!";
      router.push(`/admin/blog`);
    }
  } catch (err: any) {
    errorMessage.value =
      err?.data?.message || err?.data?.statusMessage || err?.message || "Failed to save post.";
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="blog-editor">
    <div class="editor-header">
      <div class="editor-title-group">
        <NuxtLink to="/admin/blog" class="back-link">
          ← Back to Blog Management
        </NuxtLink>
        <h2>{{ isNew ? "Create New Article" : "Edit Article" }}</h2>
      </div>

      <div class="editor-actions">
        <button
          type="button"
          class="guestbook-button secondary"
          :disabled="isSubmitting"
          @click="savePost(false)"
        >
          Save as Draft
        </button>
        <button
          type="button"
          class="guestbook-button"
          :disabled="isSubmitting"
          @click="savePost(true)"
        >
          {{ isSubmitting ? "Saving..." : published ? "Update & Keep Published" : "Publish Article" }}
        </button>
      </div>
    </div>

    <!-- Alert banners -->
    <div v-if="errorMessage" class="guestbook-alert error">
      {{ errorMessage }}
    </div>
    <div v-if="successMessage" class="guestbook-alert success">
      {{ successMessage }}
    </div>

    <form class="editor-form" @submit.prevent="savePost()">
      <!-- Title & Slug Row -->
      <div class="editor-row">
        <div class="editor-field flex-2">
          <label for="post-title">Article Title</label>
          <input
            id="post-title"
            v-model="title"
            type="text"
            placeholder="e.g., Designing Scalable Micro-Frontends"
            required
            class="guestbook-input"
            @input="onTitleInput"
          />
        </div>

        <div class="editor-field flex-1">
          <label for="post-slug">
            URL Slug
            <button
              v-if="slugManual"
              type="button"
              class="text-link-btn"
              title="Reset to match title"
              @click="resetSlugToTitle"
            >
              (reset to title)
            </button>
          </label>
          <div class="slug-input-wrapper">
            <span class="slug-prefix">/blog/</span>
            <input
              id="post-slug"
              v-model="slug"
              type="text"
              placeholder="designing-scalable-micro-frontends"
              required
              class="guestbook-input slug-input"
              @input="onSlugInput"
            />
          </div>
        </div>
      </div>

      <!-- Description / Excerpt -->
      <div class="editor-field">
        <label for="post-description">Short Excerpt / SEO Description</label>
        <textarea
          id="post-description"
          v-model="description"
          rows="2"
          placeholder="A brief summary for previews, social sharing, and search engines..."
          class="guestbook-textarea"
        ></textarea>
      </div>

      <!-- Featured Image -->
      <div class="editor-field">
        <label>Featured Header Image</label>
        <div class="featured-image-controls">
          <div class="featured-url-input">
            <input
              v-model="featuredImageUrl"
              type="url"
              placeholder="https://res.cloudinary.com/... or upload below"
              class="guestbook-input"
            />
          </div>

          <div class="featured-upload-cta">
            <input
              ref="featuredFileInput"
              type="file"
              accept="image/*"
              class="hidden-file-input"
              @change="handleFeaturedUpload"
            />
            <button
              type="button"
              class="guestbook-button secondary upload-btn"
              :disabled="isUploadingFeatured"
              @click="featuredFileInput?.click()"
            >
              <span v-if="isUploadingFeatured">Uploading to Cloudinary...</span>
              <span v-else>📁 Upload Featured Image</span>
            </button>
          </div>
        </div>

        <!-- Thumbnail Preview -->
        <div v-if="featuredImageUrl" class="featured-preview-box">
          <img :src="featuredImageUrl" alt="Featured preview" class="featured-preview-thumb" />
          <button
            type="button"
            class="remove-image-btn"
            title="Remove image"
            @click="removeFeaturedImage"
          >
            ✕ Remove
          </button>
        </div>
      </div>

      <!-- Content Area with Markdown Toolbar -->
      <div class="editor-field">
        <div class="editor-content-header">
          <label>Article Content (Markdown)</label>

          <!-- View Mode Switcher -->
          <div class="mode-tabs">
            <button
              type="button"
              class="tab-btn"
              :class="{ active: activeTab === 'write' }"
              @click="activeTab = 'write'"
            >
              Write
            </button>
            <button
              type="button"
              class="tab-btn"
              :class="{ active: activeTab === 'preview' }"
              @click="activeTab = 'preview'"
            >
              Preview
            </button>
            <button
              type="button"
              class="tab-btn split-tab"
              :class="{ active: activeTab === 'split' }"
              @click="activeTab = 'split'"
            >
              Split View
            </button>
          </div>
        </div>

        <!-- Markdown Toolbar -->
        <div v-if="activeTab !== 'preview'" class="markdown-toolbar">
          <button
            type="button"
            class="toolbar-btn"
            title="Bold"
            @click="wrapSelection('**', '**', 'bold text')"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            class="toolbar-btn"
            title="Italic"
            @click="wrapSelection('*', '*', 'italic text')"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            class="toolbar-btn"
            title="Heading 2"
            @click="insertLinePrefix('## ')"
          >
            H2
          </button>
          <button
            type="button"
            class="toolbar-btn"
            title="Heading 3"
            @click="insertLinePrefix('### ')"
          >
            H3
          </button>
          <button
            type="button"
            class="toolbar-btn"
            title="Quote"
            @click="insertLinePrefix('> ')"
          >
            ❝
          </button>
          <button
            type="button"
            class="toolbar-btn"
            title="Code Block"
            @click="wrapSelection('```ts\n', '\n```', '// code here')"
          >
            &lt;/&gt;
          </button>
          <button
            type="button"
            class="toolbar-btn"
            title="Bullet List"
            @click="insertLinePrefix('- ')"
          >
            • List
          </button>
          <button
            type="button"
            class="toolbar-btn"
            title="Link"
            @click="wrapSelection('[', '](https://)', 'link text')"
          >
            🔗 Link
          </button>

          <span class="toolbar-sep"></span>

          <!-- Inline Image Upload -->
          <input
            ref="inlineFileInput"
            type="file"
            accept="image/*"
            class="hidden-file-input"
            @change="handleInlineUpload"
          />
          <button
            type="button"
            class="toolbar-btn upload-toolbar-btn"
            :disabled="isUploadingInline"
            title="Upload image to Cloudinary & insert markdown"
            @click="inlineFileInput?.click()"
          >
            <span v-if="isUploadingInline">Uploading...</span>
            <span v-else>🖼️ Upload Image</span>
          </button>
        </div>

        <!-- Editor View Containers -->
        <div
          class="editor-panes-wrapper"
          :class="`mode-${activeTab}`"
        >
          <!-- Textarea (Write) -->
          <div v-show="activeTab === 'write' || activeTab === 'split'" class="pane-write">
            <textarea
              ref="textareaRef"
              v-model="content"
              rows="18"
              placeholder="Write your article in Markdown... You can use headings, lists, code blocks, and upload images."
              class="guestbook-textarea markdown-textarea"
            ></textarea>
          </div>

          <!-- Preview Pane -->
          <div
            v-show="activeTab === 'preview' || activeTab === 'split'"
            class="pane-preview blog-prose-content"
            v-html="renderedPreview"
          ></div>
        </div>
      </div>

      <!-- Published & Comments Toggles & Bottom Save -->
      <div class="editor-bottom-bar">
        <div class="editor-toggles-group">
          <label class="publish-checkbox-label">
            <input
              v-model="published"
              type="checkbox"
              class="publish-checkbox"
            />
            <span>Publish immediately (visible to the public)</span>
          </label>

          <label class="publish-checkbox-label">
            <input
              v-model="allowComments"
              type="checkbox"
              class="publish-checkbox"
            />
            <span>Allow comments & replies on this article</span>
          </label>
        </div>

        <div class="bottom-actions">
          <NuxtLink to="/admin/blog" class="guestbook-button secondary">
            Cancel
          </NuxtLink>
          <button
            type="submit"
            class="guestbook-button"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? "Saving..." : isNew ? "Create Article" : "Save Changes" }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>
