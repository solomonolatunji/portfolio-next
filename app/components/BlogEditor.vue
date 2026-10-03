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
    <div v-if="errorMessage" class="guestbook-alert error">{{ errorMessage }}</div>
    <div v-if="successMessage" class="guestbook-alert success">{{ successMessage }}</div>

    <form class="editor-form" @submit.prevent="savePost()">
      <!-- Title, Slug, Description & Featured Image -->
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

      <!-- Content Area with Markdown Toolbar -->
      <div class="editor-field">
        <div class="editor-content-header">
          <label>Article Content (Markdown)</label>

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

        <BlogEditorToolbar
          v-if="activeTab !== 'preview'"
          :is-uploading-inline="isUploadingInline"
          @wrap="onWrapSelection"
          @insert-prefix="onInsertLinePrefix"
          @upload-inline="handleInlineUpload"
        />

        <div class="editor-panes-wrapper" :class="`mode-${activeTab}`">
          <div v-show="activeTab === 'write' || activeTab === 'split'" class="pane-write">
            <textarea
              ref="textareaRef"
              v-model="content"
              rows="18"
              placeholder="Write your article in Markdown..."
              class="guestbook-textarea markdown-textarea"
            ></textarea>
          </div>

          <div
            v-show="activeTab === 'preview' || activeTab === 'split'"
            class="pane-preview blog-prose-content"
            v-html="renderedPreview"
          ></div>
        </div>
      </div>

      <!-- Toggles & Actions -->
      <div class="editor-bottom-bar">
        <div class="editor-toggles-group">
          <label class="publish-checkbox-label">
            <input v-model="published" type="checkbox" class="publish-checkbox" />
            <span>Publish immediately (visible to the public)</span>
          </label>

          <label class="publish-checkbox-label">
            <input v-model="featured" type="checkbox" class="publish-checkbox" />
            <span>⭐ Feature this article (Pin to top of blog, max 3)</span>
          </label>

          <label class="publish-checkbox-label">
            <input v-model="allowComments" type="checkbox" class="publish-checkbox" />
            <span>Allow comments & replies on this article</span>
          </label>
        </div>

        <div class="bottom-actions">
          <NuxtLink to="/admin/blog" class="guestbook-button secondary">
            Cancel
          </NuxtLink>
          <button type="submit" class="guestbook-button" :disabled="isSubmitting">
            {{ isSubmitting ? "Saving..." : isNew ? "Create Article" : "Save Changes" }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>
