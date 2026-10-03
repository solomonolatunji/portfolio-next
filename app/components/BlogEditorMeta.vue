<script setup lang="ts">
import { ref } from "vue";
import { uploadImageToCloudinary } from "@/composables/useBlogEditorHelpers";

const props = defineProps<{
  title: string;
  slug: string;
  slugManual: boolean;
  description: string;
  featuredImageUrl: string;
}>();

const emit = defineEmits<{
  (e: "update:title", val: string): void;
  (e: "update:slug", val: string): void;
  (e: "update:description", val: string): void;
  (e: "update:featuredImageUrl", val: string): void;
  (e: "title-input"): void;
  (e: "slug-input"): void;
  (e: "reset-slug"): void;
}>();

const fileInputRef = ref<HTMLInputElement | null>(null);
const isUploading = ref(false);
const uploadError = ref("");

async function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  isUploading.value = true;
  uploadError.value = "";
  try {
    const url = await uploadImageToCloudinary(file);
    emit("update:featuredImageUrl", url);
  } catch (err: any) {
    uploadError.value = err?.data?.message || err?.message || "Failed to upload image.";
  } finally {
    isUploading.value = false;
    if (fileInputRef.value) fileInputRef.value.value = "";
  }
}
</script>

<template>
  <div class="editor-meta-fields">
    <!-- Title & Slug Row -->
    <div class="editor-row">
      <div class="editor-field flex-2">
        <label for="post-title">Article Title</label>
        <input
          id="post-title"
          :value="title"
          type="text"
          placeholder="e.g., Designing Scalable Systems"
          required
          class="guestbook-input"
          @input="emit('update:title', ($event.target as HTMLInputElement).value); emit('title-input')"
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
            @click="emit('reset-slug')"
          >
            (reset to title)
          </button>
        </label>
        <div class="slug-input-wrapper">
          <span class="slug-prefix">/blog/</span>
          <input
            id="post-slug"
            :value="slug"
            type="text"
            placeholder="designing-scalable-systems"
            required
            class="guestbook-input slug-input"
            @input="emit('update:slug', ($event.target as HTMLInputElement).value); emit('slug-input')"
          />
        </div>
      </div>
    </div>

    <!-- Description / Excerpt -->
    <div class="editor-field">
      <label for="post-description">Short Excerpt / SEO Description</label>
      <textarea
        id="post-description"
        :value="description"
        rows="2"
        placeholder="A brief summary for previews, social sharing, and search engines..."
        class="guestbook-textarea"
        @input="emit('update:description', ($event.target as HTMLTextAreaElement).value)"
      ></textarea>
    </div>

    <!-- Featured Header Image -->
    <div class="editor-field">
      <label>Featured Header Image</label>
      <div class="featured-image-controls">
        <div class="featured-url-input">
          <input
            :value="featuredImageUrl"
            type="url"
            placeholder="https://res.cloudinary.com/... or upload below"
            class="guestbook-input"
            @input="emit('update:featuredImageUrl', ($event.target as HTMLInputElement).value)"
          />
        </div>

        <div class="featured-upload-cta">
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            class="hidden-file-input"
            @change="onFileSelected"
          />
          <button
            type="button"
            class="guestbook-button secondary upload-btn"
            :disabled="isUploading"
            @click="fileInputRef?.click()"
          >
            <span v-if="isUploading">Uploading to Cloudinary...</span>
            <span v-else>📁 Upload Featured Image</span>
          </button>
        </div>
      </div>

      <p v-if="uploadError" class="guestbook-alert error mt-2">{{ uploadError }}</p>

      <div v-if="featuredImageUrl" class="featured-preview-box">
        <img :src="featuredImageUrl" alt="Featured preview" class="featured-preview-thumb" />
        <button
          type="button"
          class="remove-image-btn"
          title="Remove image"
          @click="emit('update:featuredImageUrl', '')"
        >
          ✕ Remove
        </button>
      </div>
    </div>
  </div>
</template>
