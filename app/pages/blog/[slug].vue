<script setup lang="ts">
import { computed } from "vue";
import BlogComments from "@/components/BlogComments.vue";
import BlogReactions from "@/components/BlogReactions.vue";
import type { BlogPost, BlogComment, BlogReactionsSummary } from "@/interfaces/blog";
import type { GuestbookUser } from "@/interfaces/guestbook";
import { formatDate } from "@/utils/date";
import { renderMarkdown } from "@/utils/markdown";
const siteConfig = useSiteConfig();

const route = useRoute();
const slug = computed(() => route.params.slug as string);

const { data, status, error } = await useAsyncData(
  `post-${slug.value}`,
  async () => {
    return await $fetch<{
      post: BlogPost;
      comments: BlogComment[];
      reactions: BlogReactionsSummary;
    }>(`/api/posts/${slug.value}` as string);
  }
);

const { data: userData } = await useAsyncData(
  "current-user-post",
  async () => {
    return await $fetch<{ user: GuestbookUser | null }>("/api/auth/me" as string).catch(() => ({ user: null }));
  }
);

const post = computed(() => data.value?.post);
const comments = computed(() => data.value?.comments || []);
const reactions = computed(() => data.value?.reactions || {
  counts: { heart: 0, fire: 0, rocket: 0, like: 0, bulb: 0 },
  userReactions: [],
  total: 0,
});
const currentUser = computed(() => userData.value?.user || null);

const htmlContent = computed(() => {
  return post.value ? renderMarkdown(post.value.content) : "";
});

useHead(() => ({
  title: post.value ? siteConfig.pageTitle(post.value.title) : siteConfig.pageTitle("Article"),
}));

useSeoMeta({
  title: () => post.value?.title || "Article",
  description: () => post.value?.description || "",
  ogTitle: () => post.value?.title || "Article",
  ogDescription: () => post.value?.description || "",
  ogImage: () => post.value?.featuredImageUrl || "/favicon.svg",
  ogType: "article",
});
</script>

<template>
  <div class="blog-detail-page">
    <div class="blog-back-bar">
      <NuxtLink to="/blog" class="back-link">
        ← All Articles
      </NuxtLink>
    </div>

    <div v-if="status === 'pending'" class="guestbook-empty">
      Loading article...
    </div>

    <div v-else-if="error || !post" class="guestbook-empty">
      <p>Article not found.</p>
      <NuxtLink to="/blog" class="guestbook-button mt-4 inline-flex">
        Return to Blog
      </NuxtLink>
    </div>

    <article v-else class="blog-article-container">
      <!-- Article Header -->
      <header class="blog-article-header">
        <div class="article-meta-row">
          <time>{{ formatDate(post.createdAt) }}</time>
          <span class="meta-dot">·</span>
          <span>{{ post.readTimeMinutes }} min read</span>
          <span v-if="post.views > 0" class="meta-dot">·</span>
          <span v-if="post.views > 0">{{ post.views }} views</span>
          <span v-if="!post.published" class="draft-badge">Draft Preview</span>
        </div>

        <h1 class="blog-article-title">{{ post.title }}</h1>
        <p class="blog-article-desc">{{ post.description }}</p>

        <div class="blog-author-strip">
          <img
            :src="`https://github.com/${siteConfig.adminUsername}.png`"
            :alt="siteConfig.name"
            class="author-avatar"
          />
          <div>
            <strong>{{ siteConfig.name }}</strong>
            <span class="author-handle">@{{ siteConfig.adminUsername }}</span>
          </div>
        </div>
      </header>

      <!-- Featured Image Banner -->
      <div v-if="post.featuredImageUrl" class="blog-featured-banner">
        <img
          :src="post.featuredImageUrl"
          :alt="post.title"
          class="featured-banner-img"
        />
      </div>

      <!-- Markdown Content Body -->
      <div class="blog-prose-content" v-html="htmlContent" />

      <!-- Reaction Bar (Available for all posts) -->
      <div class="blog-article-reactions">
        <BlogReactions
          :post-id="post.id"
          :initial-reactions="reactions"
          :current-user="currentUser"
        />
      </div>

      <!-- Comments & Discussion (Only if enabled for this post) -->
      <BlogComments
        v-if="post.allowComments"
        :post-id="post.id"
        :initial-comments="comments"
        :current-user="currentUser"
      />
    </article>
  </div>
</template>
