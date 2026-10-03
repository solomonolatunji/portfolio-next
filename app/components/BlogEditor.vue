<script setup lang="ts">
import { computed, ref } from "vue";
import type { BlogPost } from "@/interfaces/blog";
import { renderMarkdown } from "@/utils/markdown";
import BlogEditorMeta from "@/components/BlogEditorMeta.vue";
import BlogEditorToolbar from "@/components/BlogEditorToolbar.vue";
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
const description = ref(props.post?.description || "");
const content = ref(props.post?.content || "");
const featuredImageUrl = ref(props.post?.featuredImageUrl || "");
const published = ref(props.post ? Boolean(props.post.published) : false);
const featured = ref(props.post ? Boolean(props.post.featured) : false);
const allowComments = ref(props.post ? Boolean(props.post.allowComments) : true);

const activeTab = ref<"write" | "preview" | "split">("write");
const isSubmitting = ref(false);
const isUploadingInline = ref(false);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const tabs = [
  { value: "write", label: "Write" },
  { value: "preview", label: "Preview" },
  { value: "split", label: "Split View" },
] as const;

const proseClass = [
  "text-[1.02rem] leading-[1.75] text-gray-300",
  "[&_h1]:mt-8 [&_h1]:mb-3 [&_h1]:text-[1.8rem] [&_h1]:font-bold [&_h1]:leading-snug [&_h1]:text-ink",
  "[&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:border-b [&_h2]:border-line [&_h2]:pb-1.5 [&_h2]:text-[1.45rem] [&_h2]:font-bold [&_h2]:leading-snug [&_h2]:text-ink",
  "[&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-[1.2rem] [&_h3]:font-bold [&_h3]:leading-snug [&_h3]:text-ink",
  "[&_p]:mb-5 [&_strong]:font-bold [&_strong]:text-ink",
  "[&_a]:text-blue-400 [&_a]:underline [&_a]:underline-offset-[3px] [&_a:hover]:text-blue-300",
  "[&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1",
  "[&_blockquote]:mb-5 [&_blockquote]:border-l-[3px] [&_blockquote]:border-line-strong [&_blockquote]:pl-4 [&_blockquote]:text-muted",
  "[&_code]:rounded [&_code]:bg-chip [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.88em]",
  "[&_pre]:mb-5 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-line [&_pre]:bg-elevated [&_pre]:p-4",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
  "[&_img]:my-5 [&_img]:max-w-full [&_img]:rounded-lg [&_hr]:my-8 [&_hr]:border-line",
].join(" ");

function onTitleInput() {
  if (!slugManual.value) slug.value = slugify(title.value);
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

function onWrapSelection(prefix: string, suffix = "", defaultText = "text") {
  wrapMarkdownSelection(textareaRef.value, content, prefix, suffix, defaultText);
}

function onInsertLinePrefix(prefix: string) {
  insertMarkdownLinePrefix(textareaRef.value, content, prefix);
}

async function handleInlineUpload(file: File) {
  isUploadingInline.value = true;
  errorMessage.value = null;
  try {
    const url = await uploadImageToCloudinary(file);
    const alt = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    onWrapSelection(`![${alt}](`, `${url})`, "");
  } catch (err: any) {
    errorMessage.value = err?.data?.message || err?.message || "Failed to upload inline image.";
  } finally {
    isUploadingInline.value = false;
  }
}

async function savePost(publishState?: boolean) {
  if (publishState !== undefined) published.value = publishState;
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
  } catch (err: any) {
    errorMessage.value =
      err?.data?.message || err?.data?.statusMessage || err?.message || "Failed to save post.";
  } finally {
    isSubmitting.value = false;
  }
}
</script>

</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <NuxtLink to="/admin/blog" class="text-[0.8rem] text-soft transition-colors hover:text-ink">
          ← Back to Blog Management
        </NuxtLink>
        <h2 class="mt-1 text-[1.6rem] font-bold text-ink">{{ isNew ? "Create New Article" : "Edit Article" }}</h2>
      </div>

      <div class="flex items-center gap-3">
        <UButton color="neutral" variant="outline" :disabled="isSubmitting" @click="savePost(false)">
          Save as Draft
        </UButton>
        <UButton color="neutral" :disabled="isSubmitting" @click="savePost(true)">
          {{ isSubmitting ? "Saving..." : published ? "Update & Keep Published" : "Publish Article" }}
        </UButton>
      </div>
    </div>

    <UAlert v-if="errorMessage" color="error" variant="subtle" :title="errorMessage" />
    <UAlert v-if="successMessage" color="success" variant="subtle" :title="successMessage" />

    <form class="flex flex-col gap-5" @submit.prevent="savePost()">
      <BlogEditorMeta
        v-model:title="title"
        v-model:slug="slug"
        v-model:description="description"
        v-model:featured-image-url="featuredImageUrl"
        :slug-manual="slugManual"
        @title-input="onTitleInput"
        @slug-input="onSlugInput"
        @reset-slug="resetSlugToTitle"
      />

      <div class="flex w-full flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="text-[0.82rem] font-semibold text-muted">Article Content (Markdown)</label>

          <div class="flex gap-1 rounded-lg border border-line bg-card p-[0.2rem]">
            <UButton
              v-for="tab in tabs"
              :key="tab.value"
              size="xs"
              color="neutral"
              :variant="activeTab === tab.value ? 'soft' : 'ghost'"
              :class="tab.value === 'split' ? 'hidden md:inline-flex' : ''"
              @click="activeTab = tab.value"
            >
              {{ tab.label }}
            </UButton>
          </div>
        </div>

        <BlogEditorToolbar
          v-if="activeTab !== 'preview'"
          :is-uploading-inline="isUploadingInline"
          @wrap="onWrapSelection"
          @insert-prefix="onInsertLinePrefix"
          @upload-inline="handleInlineUpload"
        />

        <div
          class="flex min-h-[400px] flex-col overflow-hidden rounded-b-lg border border-line bg-card md:flex-row"
          :class="activeTab === 'preview' ? 'rounded-t-lg' : 'border-t-0'"
        >
          <div
            v-show="activeTab === 'write' || activeTab === 'split'"
            class="min-w-0 flex-1"
            :class="activeTab === 'split' ? 'border-b border-line md:border-b-0 md:border-r' : ''"
          >
            <textarea
              ref="textareaRef"
              v-model="content"
              rows="18"
              placeholder="Write your article in Markdown..."
              class="size-full min-h-[420px] resize-y bg-transparent p-4 font-mono text-[0.9rem] leading-relaxed text-ink outline-none placeholder:text-soft"
            ></textarea>
          </div>

          <div
            v-show="activeTab === 'preview' || activeTab === 'split'"
            :class="proseClass"
            class="max-h-[600px] min-w-0 flex-1 overflow-y-auto bg-black/20 px-[1.4rem] py-4"
            v-html="renderedPreview"
          ></div>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
        <div class="flex flex-col gap-2.5">
          <USwitch v-model="published" color="success" label="Publish immediately (visible to the public)" />
          <USwitch v-model="featured" color="success" label="⭐ Feature this article (Pin to top of blog, max 3)" />
          <USwitch v-model="allowComments" color="success" label="Allow comments & replies on this article" />
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
