<script setup lang="ts">
import { ref } from "vue";
import { formatPageTitle } from "@/constants/site";
import type { BlogPostSummary } from "@/interfaces/blog";
import { formatDate } from "@/utils/date";

definePageMeta({
  middleware: "admin",
});

useHead({
  title: formatPageTitle("Admin Blog Management"),
});

const { data, status, refresh } = await useAsyncData(
  "admin-blog-posts",
  async () => {
    return await $fetch<{ posts: BlogPostSummary[] }>("/api/admin/posts" as string);
  }
);

const posts = computed(() => data.value?.posts || []);
const deletingId = ref<number | null>(null);

async function togglePublish(post: BlogPostSummary) {
  try {
    await $fetch(`/api/admin/posts/${post.id}` as string, {
      method: "PUT",
      body: { published: !post.published },
    });
    await refresh();
  } catch (err) {
    console.error("Failed to toggle publish status:", err);
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
  <div class="admin-blog-page">
    <div class="section-heading">
      <div class="blog-header-row">
        <div>
          <p class="eyebrow">Content Management</p>
          <h1>Blog Posts</h1>
          <p class="section-copy">Manage your published articles, drafts, and metrics.</p>
        </div>
        <div class="admin-create-cta">
          <NuxtLink to="/admin/blog/new" class="guestbook-button">
            ✍️ New Article
          </NuxtLink>
        </div>
      </div>
    </div>

    <div v-if="status === 'pending'" class="guestbook-empty">
      Loading posts...
    </div>

    <div v-else-if="posts.length === 0" class="guestbook-empty">
      <p>No posts written yet.</p>
      <NuxtLink to="/admin/blog/new" class="guestbook-button mt-4 inline-flex">
        Create Your First Article
      </NuxtLink>
    </div>

    <div v-else class="admin-posts-list">
      <div v-for="post in posts" :key="post.id" class="admin-post-row guestbook-card">
        <div class="admin-post-info">
          <div class="admin-post-badges">
            <span
              class="status-badge"
              :class="post.published ? 'is-published' : 'is-draft'"
            >
              {{ post.published ? 'Published' : 'Draft' }}
            </span>
            <span class="admin-post-date">{{ formatDate(post.createdAt) }}</span>
            <span class="meta-dot">·</span>
            <span>{{ post.views }} views</span>
            <span class="meta-dot">·</span>
            <span>❤️ {{ post.reactionCount }}</span>
            <span class="meta-dot">·</span>
            <span>💬 {{ post.commentCount }}</span>
          </div>

          <h3 class="admin-post-title">
            <NuxtLink :to="`/admin/blog/${post.id}`">{{ post.title }}</NuxtLink>
          </h3>
          <p class="admin-post-slug">/blog/{{ post.slug }}</p>
        </div>

        <div class="admin-post-actions">
          <button
            type="button"
            class="admin-action-btn"
            @click="togglePublish(post)"
          >
            {{ post.published ? 'Unpublish' : 'Publish' }}
          </button>
          <NuxtLink :to="`/admin/blog/${post.id}`" class="admin-action-btn">
            Edit
          </NuxtLink>
          <NuxtLink
            :to="`/blog/${post.slug}`"
            target="_blank"
            class="admin-action-btn"
          >
            View ↗
          </NuxtLink>
          <button
            type="button"
            class="admin-action-btn delete-btn"
            :disabled="deletingId === post.id"
            @click="deletePost(post)"
          >
            {{ deletingId === post.id ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
