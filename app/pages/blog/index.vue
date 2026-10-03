<script setup lang="ts">
import { computed, ref } from "vue";
import { formatPageTitle } from "@/constants/site";
import type { BlogPostSummary } from "@/interfaces/blog";
import type { GuestbookUser } from "@/interfaces/guestbook";
import { formatDate } from "@/utils/date";

useHead({
  title: formatPageTitle("Blog"),
  meta: [
    {
      name: "description",
      content: "Articles, insights, and thoughts on technology, engineering, and product development.",
    },
  ],
});

const searchQuery = ref("");

const { data: postsData, status, refresh } = await useAsyncData(
  "blog-posts",
  async () => {
    return await $fetch<{ posts: BlogPostSummary[] }>("/api/posts" as string);
  }
);

const { data: userData } = await useAsyncData(
  "current-user-blog",
  async () => {
    return await $fetch<{ user: GuestbookUser | null }>("/api/auth/me" as string).catch(() => ({ user: null }));
  }
);

const posts = computed(() => postsData.value?.posts || []);
const currentUser = computed(() => userData.value?.user || null);

const filteredPosts = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return posts.value;
  return posts.value.filter(
    (p) =>
      p.title.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
  );
});
</script>

<template>
  <div class="blog-index-page">
    <div class="section-heading blog-heading">
      <div class="blog-header-row">
        <div>
          <p class="eyebrow">Writing & Insights</p>
          <h1>Blog</h1>
          <p class="section-copy">
            Notes on software engineering, architecture, systems design, and building things.
          </p>
        </div>
        <div v-if="currentUser?.isAdmin" class="admin-create-cta">
          <NuxtLink to="/admin/blog/new" class="guestbook-button">
            ✍️ Write New Post
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Search / Filter -->
    <div v-if="posts.length > 0" class="blog-search-bar">
      <UInput
        v-model="searchQuery"
        placeholder="Search articles..."
        icon="i-heroicons-magnifying-glass"
        size="md"
        class="w-full"
      />
    </div>

    <!-- Posts Grid -->
    <div v-if="status === 'pending'" class="guestbook-empty">
      Loading articles...
    </div>

    <div v-else-if="filteredPosts.length === 0" class="guestbook-empty">
      {{ searchQuery ? 'No articles matching your search.' : 'No articles published yet. Check back soon!' }}
    </div>

    <div v-else class="blog-posts-grid">
      <article v-for="post in filteredPosts" :key="post.id" class="blog-card">
        <NuxtLink :to="`/blog/${post.slug}`" class="blog-card-link">
          <div v-if="post.featuredImageUrl" class="blog-card-image-wrap">
            <img
              :src="post.featuredImageUrl"
              :alt="post.title"
              class="blog-card-image"
              loading="lazy"
            />
          </div>
          <div class="blog-card-content">
            <div class="blog-card-meta">
              <time>{{ formatDate(post.createdAt) }}</time>
              <span class="meta-dot">·</span>
              <span>{{ post.readTimeMinutes }} min read</span>
              <span v-if="post.views > 0" class="meta-dot">·</span>
              <span v-if="post.views > 0">{{ post.views }} views</span>
            </div>
            <h2 class="blog-card-title">{{ post.title }}</h2>
            <p class="blog-card-desc">{{ post.description }}</p>

            <div class="blog-card-footer">
              <span class="read-more-text">Read article →</span>
              <div class="blog-card-stats">
                <span v-if="post.reactionCount > 0" class="card-stat">
                  ❤️ {{ post.reactionCount }}
                </span>
                <span v-if="post.commentCount > 0" class="card-stat">
                  💬 {{ post.commentCount }}
                </span>
              </div>
            </div>
          </div>
        </NuxtLink>
      </article>
    </div>
  </div>
</template>
