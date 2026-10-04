<script setup lang="ts">
import { ref } from "vue";
import { uploadImageToCloudinary } from "@/composables/useBlogEditorHelpers";

const props = defineProps<{
  title: string;
  slug: string;
  slugManual: boolean;
  categoryId: string;
  description: string;
  featuredImageUrl: string;
}>();

const emit = defineEmits<{
  (e: "update:title", val: string): void;
  (e: "update:slug", val: string): void;
  (e: "update:categoryId", val: string): void;
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
  } catch (err: unknown) {
    const errorObj = err as { data?: { message?: string }; message?: string };
    uploadError.value = errorObj.data?.message || errorObj.message || "Failed to upload image.";
  } finally {
    isUploading.value = false;
    if (fileInputRef.value) fileInputRef.value.value = "";
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Title & Slug & Category Row -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
      <div class="md:col-span-2">
        <label for="post-title" class="text-muted mb-1.5 block text-xs font-semibold"
          >Article Title</label
        >
        <input
          id="post-title"
          :value="title"
          type="text"
          placeholder="e.g., Designing Scalable Systems"
          required
          class="border-line bg-card text-ink placeholder:text-soft focus:border-line-strong w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
          @input="
            emit('update:title', ($event.target as HTMLInputElement).value);
            emit('title-input');
          "
        />
      </div>

      <div>
        <div class="mb-1.5 flex items-center justify-between">
          <label for="post-slug" class="text-muted text-xs font-semibold">URL Slug</label>
          <button
            v-if="slugManual"
            type="button"
            class="text-soft hover:text-ink cursor-pointer text-xs transition-colors"
            title="Reset to match title"
            @click="emit('reset-slug')"
          >
            (sync)
          </button>
          <span v-else class="text-soft text-[0.7rem] italic">(auto)</span>
        </div>
        <div class="flex">
          <span
            class="border-line bg-elevated text-soft inline-flex items-center rounded-l-lg border border-r-0 px-2 text-xs"
          >
            /
          </span>
          <input
            id="post-slug"
            :value="slug"
            type="text"
            placeholder="designing-systems"
            required
            class="border-line bg-card text-ink placeholder:text-soft focus:border-line-strong w-full rounded-r-lg border px-2.5 py-2 text-sm focus:outline-none"
            @input="
              emit('update:slug', ($event.target as HTMLInputElement).value);
              emit('slug-input');
            "
          />
        </div>
      </div>

      <div>
        <label for="post-category" class="text-muted mb-1.5 block text-xs font-semibold">
          Category
        </label>
        <select
          id="post-category"
          :value="categoryId"
          class="border-line bg-card text-ink focus:border-line-strong w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
          @change="emit('update:categoryId', ($event.target as HTMLSelectElement).value)"
        >
          <option value="engineering">Engineering & Systems</option>
          <option value="startups">Startups & Capital</option>
          <option value="philosophy">Philosophy & Reason</option>
          <option value="mindset">Mindset & Life</option>
        </select>
      </div>
    </div>

    <!-- Description / Excerpt -->
    <div>
      <label for="post-description" class="text-muted mb-1.5 block text-xs font-semibold"
        >Short Excerpt / SEO Description</label
      >
      <textarea
        id="post-description"
        :value="description"
        rows="2"
        placeholder="A brief summary for previews, social sharing, and search engines..."
        class="border-line bg-card text-ink placeholder:text-soft focus:border-line-strong w-full resize-y rounded-lg border px-3 py-2 text-sm leading-relaxed focus:outline-none"
        @input="emit('update:description', ($event.target as HTMLTextAreaElement).value)"
      ></textarea>
    </div>

    <!-- Featured Header Image -->
    <div>
      <label class="text-muted mb-1.5 block text-xs font-semibold">Featured Header Image</label>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          :value="featuredImageUrl"
          type="url"
          placeholder="https://res.cloudinary.com/... or upload below"
          class="border-line bg-card text-ink placeholder:text-soft focus:border-line-strong w-full flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none"
          @input="emit('update:featuredImageUrl', ($event.target as HTMLInputElement).value)"
        />

        <div class="shrink-0">
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            class="hidden"
            @change="onFileSelected"
          />
          <UButton
            type="button"
            color="neutral"
            variant="outline"
            :loading="isUploading"
            @click="fileInputRef?.click()"
          >
            📁 Upload Image
          </UButton>
        </div>
      </div>

      <p v-if="uploadError" class="mt-2 text-xs text-red-400" role="alert">{{ uploadError }}</p>

      <div
        v-if="featuredImageUrl"
        class="border-line relative mt-3 inline-block overflow-hidden rounded-lg border"
      >
        <img :src="featuredImageUrl" alt="Featured preview" class="h-32 w-auto object-cover" />
        <button
          type="button"
          class="absolute top-2 right-2 cursor-pointer rounded-md bg-black/70 px-2 py-1 text-xs text-white backdrop-blur-xs transition-colors hover:bg-black"
          title="Remove image"
          @click="emit('update:featuredImageUrl', '')"
        >
          ✕ Remove
        </button>
      </div>
    </div>
  </div>
</template>
