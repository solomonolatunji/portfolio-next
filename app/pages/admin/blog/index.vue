<script setup lang="ts">
import { computed, ref } from "vue";
import type { BlogPostSummary } from "@/interfaces/blog";
import { formatDate } from "@/utils/date";

const siteConfig = usePortfolioConfig();

definePageMeta({
  middleware: "admin",
});

useHead({
  title: siteConfig.pageTitle("Admin Blog Management"),
});

const { data, status, refresh } = await useAsyncData("admin-blog-posts", async () => {
  return await $fetch<{ posts: BlogPostSummary[] }>("/api/admin/posts" as string);
});

const posts = computed(() => data.value?.posts || []);
const deletingId = ref<number | null>(null);
const publishingId = ref<number | null>(null);
const featuringId = ref<number | null>(null);

async function togglePublish(post: BlogPostSummary) {
  publishingId.value = post.id;
  try {
    await $fetch(`/api/admin/posts/${post.id}` as string, {
      method: "PUT",
      body: { published: !post.published },
    });
    await refresh();
  } catch (err) {
    console.error("Failed to toggle publish status:", err);
  } finally {
    publishingId.value = null;
  }
}

async function toggleFeatured(post: BlogPostSummary) {
  featuringId.value = post.id;
  try {
    await $fetch(`/api/admin/posts/${post.id}` as string, {
      method: "PUT",
      body: { featured: !post.featured },
    });
    await refresh();
  } catch (err) {
    console.error("Failed to toggle featured status:", err);
  } finally {
    featuringId.value = null;
  }
}

async function deletePost(post: BlogPostSummary) {
  if (!confirm(`Are you sure you want to delete "${post.title}"? This cannot be undone.`)) {
    return;
  }
  deletingId.value = post.id;
  try {
    await $fetch(`/api/admin/posts/${post.id}` as string, {
      method: "DELETE",
    });
    await refresh();
  } catch (err) {
    console.error("Failed to delete post:", err);
  } finally {
    deletingId.value = null;
  }
}
</script>

<template>
  <div class="mx-auto mt-6 flex w-full max-w-[760px] flex-col gap-8">
    <div class="border-line flex flex-wrap items-start justify-between gap-4 border-b pb-6">
      <div>
        <p class="text-soft text-xs font-semibold tracking-wider uppercase">Content Management</p>
        <h1 class="text-ink mt-1 text-3xl font-bold tracking-tight">Blog Posts</h1>
        <p class="text-muted mt-1 text-sm">
          Manage your published articles, drafts, and engagement metrics.
        </p>
      </div>
      <div>
        <UButton to="/admin/blog/new" color="neutral"> ✍️ New Article </UButton>
      </div>
    </div>

    <div
      v-if="status === 'pending'"
      class="border-line bg-card/40 text-soft flex items-center justify-center rounded-xl border p-12 text-sm"
    >
      Loading posts...
    </div>

    <div
      v-else-if="posts.length === 0"
      class="border-line flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center"
    >
      <p class="text-muted text-sm">No posts written yet.</p>
      <UButton to="/admin/blog/new" color="neutral" class="mt-4">
        Create Your First Article
      </UButton>
    </div>

    <div v-else class="flex flex-col gap-4">
      <div
        v-for="post in posts"
        :key="post.id"
        class="border-line bg-card/60 hover:border-line-strong flex flex-col justify-between gap-4 rounded-xl border p-5 transition-colors lg:flex-row lg:items-center"
      >
        <div class="flex min-w-0 flex-1 flex-col gap-2">
          <div class="text-soft flex flex-wrap items-center gap-2 text-xs">
            <span
              class="rounded-full px-2 py-0.5 font-medium"
              :class="
                post.published
                  ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                  : 'border border-amber-500/20 bg-amber-500/10 text-amber-400'
              "
            >
              {{ post.published ? "Published" : "Draft" }}
            </span>
            <span
              v-if="post.category"
              class="border-border/40 bg-elevated/40 text-muted rounded-full border px-2 py-0.5 text-[0.65rem] font-medium"
            >
              {{ post.category.name }}
            </span>
            <span
              v-if="post.featured"
              class="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2 py-0.5 font-medium text-yellow-400"
            >
              ⭐ Featured
            </span>
            <span>{{ formatDate(post.createdAt) }}</span>
            <span>·</span>
            <span>{{ post.views }} views</span>
            <span>·</span>
            <span>❤️ {{ post.reactionCount }}</span>
            <span>·</span>
            <span>💬 {{ post.commentCount }}</span>
          </div>

          <h3 class="text-ink text-base font-semibold hover:underline">
            <NuxtLink :to="`/admin/blog/${post.id}`">{{ post.title }}</NuxtLink>
          </h3>
          <p class="text-soft font-mono text-xs">/blog/{{ post.slug }}</p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <UButton
            size="xs"
            color="neutral"
            :variant="post.featured ? 'solid' : 'outline'"
            :loading="featuringId === post.id"
            :disabled="Boolean(featuringId || publishingId || deletingId)"
            @click="toggleFeatured(post)"
          >
            {{ post.featured ? "⭐ Unfeature" : "☆ Feature" }}
          </UButton>
          <UButton
            size="xs"
            color="neutral"
            variant="outline"
            :loading="publishingId === post.id"
            :disabled="Boolean(featuringId || publishingId || deletingId)"
            @click="togglePublish(post)"
          >
            {{ post.published ? "Unpublish" : "Publish" }}
          </UButton>
          <UButton
            size="xs"
            color="neutral"
            variant="outline"
            :to="`/admin/blog/${post.id}`"
            :disabled="Boolean(featuringId || publishingId || deletingId)"
          >
            Edit
          </UButton>
          <UButton
            size="xs"
            color="neutral"
            variant="ghost"
            :to="`/blog/${post.slug}`"
            target="_blank"
          >
            View ↗
          </UButton>
          <UButton
            size="xs"
            color="error"
            variant="ghost"
            :loading="deletingId === post.id"
            :disabled="Boolean(featuringId || publishingId || deletingId)"
            @click="deletePost(post)"
          >
            Delete
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
