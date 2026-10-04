<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { BlogPost } from "@/interfaces/blog";
import { renderMarkdown } from "@/utils/markdown";
import BlogEditorMeta from "@/components/blog/BlogEditorMeta.vue";
import BlogEditorToolbar from "@/components/blog/BlogEditorToolbar.vue";
import BlogProse from "@/components/blog/BlogProse.vue";
import {
  slugify,
  wrapMarkdownSelection,
  insertMarkdownLinePrefix,
  uploadImageToCloudinary,
} from "@/composables/useBlogEditorHelpers";

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
const categoryId = ref(props.post?.categoryId || "engineering");
const description = ref(props.post?.description || "");
const content = ref(props.post?.content || "");
const featuredImageUrl = ref(props.post?.featuredImageUrl || "");
const published = ref(props.post ? Boolean(props.post.published) : false);
const featured = ref(props.post ? Boolean(props.post.featured) : false);
const allowComments = ref(props.post ? Boolean(props.post.allowComments) : true);

const activeTab = ref<"write" | "preview" | "split">("write");
const isSubmitting = ref(false);
const submittingAction = ref<"draft" | "publish" | null>(null);
const isUploadingInline = ref(false);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const textareaRef = ref<HTMLTextAreaElement | null>(null);

const tabs = [
  { value: "write", label: "Write" },
  { value: "preview", label: "Preview" },
  { value: "split", label: "Split View" },
] as const;

watch(title, (newTitle) => {
  if (!slugManual.value) slug.value = slugify(newTitle);
});

function onTitleInput() {
  if (!slugManual.value) slug.value = slugify(title.value);
}

function onSlugInput() {
  slugManual.value = Boolean(slug.value.trim());
  if (!slugManual.value) slug.value = slugify(title.value);
}

function resetSlugToTitle() {
  slugManual.value = false;
  slug.value = slugify(title.value);
}

const renderedPreview = computed(() =>
  renderMarkdown(content.value || "*Nothing to preview yet.*")
);

const onWrapSelection = (prefix: string, suffix = "", defaultText = "text") =>
  wrapMarkdownSelection(textareaRef.value, content, prefix, suffix, defaultText);

const onInsertLinePrefix = (prefix: string) =>
  insertMarkdownLinePrefix(textareaRef.value, content, prefix);

async function handleInlineUpload(file: File) {
  isUploadingInline.value = true;
  errorMessage.value = null;
  try {
    const url = await uploadImageToCloudinary(file);
    const alt = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    onWrapSelection(`![${alt}](`, `${url})`, "");
  } catch (err: unknown) {
    const errObj = err as { data?: { message?: string }; message?: string };
    errorMessage.value = errObj.data?.message || errObj.message || "Upload failed.";
  } finally {
    isUploadingInline.value = false;
  }
}

async function savePost(explicitPublish?: boolean) {
  if (!title.value.trim() || !slug.value.trim()) {
    errorMessage.value = "Article title and URL slug are required.";
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = null;
  successMessage.value = null;

  if (explicitPublish !== undefined) {
    published.value = explicitPublish;
    submittingAction.value = explicitPublish ? "publish" : "draft";
  } else {
    submittingAction.value = published.value ? "publish" : "draft";
  }

  const payload = {
    title: title.value.trim(),
    slug: slug.value.trim(),
    categoryId: categoryId.value,
    description: description.value.trim(),
    content: content.value,
    featuredImageUrl: featuredImageUrl.value.trim() || null,
    published: published.value,
    featured: featured.value,
    allowComments: allowComments.value,
  };

  try {
    if (props.isNew) {
      await $fetch<{ id: number; slug: string }>("/api/admin/posts", {
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
  } catch (err: unknown) {
    const errObj = err as { data?: { message?: string; statusMessage?: string }; message?: string };
    errorMessage.value =
      errObj.data?.message || errObj.data?.statusMessage || errObj.message || "Failed to save.";
  } finally {
    isSubmitting.value = false;
    submittingAction.value = null;
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <NuxtLink to="/admin/blog" class="text-soft hover:text-ink text-xs transition-colors">
          ← Back to Blog Management
        </NuxtLink>
        <h2 class="text-ink mt-1 text-2xl font-bold tracking-tight">
          {{ isNew ? "Create New Article" : "Edit Article" }}
        </h2>
      </div>

      <div class="flex items-center gap-3">
        <UButton
          color="neutral"
          variant="outline"
          :loading="submittingAction === 'draft'"
          :disabled="isSubmitting"
          @click="savePost(false)"
        >
          Save as Draft
        </UButton>
        <UButton
          color="neutral"
          :loading="submittingAction === 'publish'"
          :disabled="isSubmitting"
          @click="savePost(true)"
        >
          {{
            published ? (isNew ? "Publish Article" : "Update & Keep Published") : "Publish Article"
          }}
        </UButton>
      </div>
    </div>

    <UAlert v-if="errorMessage" color="error" variant="subtle" :title="errorMessage" />
    <UAlert v-if="successMessage" color="success" variant="subtle" :title="successMessage" />

    <form class="flex flex-col gap-5" @submit.prevent="savePost()">
      <BlogEditorMeta
        v-model:title="title"
        v-model:slug="slug"
        v-model:category-id="categoryId"
        v-model:description="description"
        v-model:featured-image-url="featuredImageUrl"
        :slug-manual="slugManual"
        @title-input="onTitleInput"
        @slug-input="onSlugInput"
        @reset-slug="resetSlugToTitle"
      />

      <div class="flex w-full flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="text-muted text-xs font-semibold">Article Content (Markdown)</label>
          <div class="flex items-center gap-1">
            <button
              v-for="t in tabs"
              :key="t.value"
              type="button"
              class="cursor-pointer rounded-md px-2.5 py-1 text-xs transition-colors"
              :class="
                activeTab === t.value
                  ? 'bg-elevated text-ink font-semibold'
                  : 'text-soft hover:text-ink'
              "
              @click="activeTab = t.value"
            >
              {{ t.label }}
            </button>
          </div>
        </div>

        <BlogEditorToolbar
          :is-uploading="isUploadingInline"
          @wrap="onWrapSelection"
          @prefix="onInsertLinePrefix"
          @upload="handleInlineUpload"
        />

        <div
          class="border-line bg-card flex min-h-[420px] flex-col overflow-hidden rounded-xl border md:flex-row"
        >
          <div
            v-show="activeTab === 'write' || activeTab === 'split'"
            class="min-w-0 flex-1"
            :class="activeTab === 'split' ? 'border-line border-b md:border-r md:border-b-0' : ''"
          >
            <textarea
              ref="textareaRef"
              v-model="content"
              rows="18"
              placeholder="Write your article in Markdown..."
              class="text-ink placeholder:text-soft size-full min-h-[420px] resize-y bg-transparent p-4 font-mono text-sm leading-relaxed outline-none"
            ></textarea>
          </div>

          <div
            v-show="activeTab === 'preview' || activeTab === 'split'"
            class="max-h-[600px] min-w-0 flex-1 overflow-y-auto bg-black/20 p-4"
          >
            <BlogProse :content="renderedPreview" class="!my-0" />
          </div>
        </div>
      </div>

      <div class="border-line flex flex-wrap items-center justify-between gap-4 border-t pt-4">
        <div class="flex flex-col gap-2.5">
          <USwitch
            v-model="published"
            color="success"
            label="Publish immediately (visible to the public)"
          />
          <USwitch
            v-model="featured"
            color="success"
            label="⭐ Feature this article (Pin to top of blog, max 3)"
          />
          <USwitch
            v-model="allowComments"
            color="success"
            label="Allow comments & replies on this article"
          />
        </div>

        <div class="flex items-center gap-3">
          <UButton to="/admin/blog" color="neutral" variant="outline">Cancel</UButton>
          <UButton type="submit" color="neutral" :disabled="isSubmitting">
            {{ isSubmitting ? "Saving..." : isNew ? "Create Article" : "Save Changes" }}
          </UButton>
        </div>
      </div>
    </form>
  </div>
</template>
