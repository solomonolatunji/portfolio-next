<script setup lang="ts">
import type { BlogPostSummary } from "@/interfaces/blog";
import { formatDate } from "@/utils/date";

defineProps<{
  post: BlogPostSummary;
}>();
</script>

<template>
  <article class="blog-card">
    <NuxtLink
      v-if="post.featuredImageUrl"
      :to="`/blog/${post.slug}`"
      class="blog-card-media"
      tabindex="-1"
      aria-hidden="true"
    >
      <img
        :src="post.featuredImageUrl"
        :alt="post.title"
        class="blog-card-img"
        loading="lazy"
      />
    </NuxtLink>

    <div class="blog-card-content">
      <div class="blog-card-meta">
        <span v-if="post.featured" class="featured-pill">⭐ Featured</span>
        <time>{{ formatDate(post.createdAt) }}</time>
        <span class="meta-dot">·</span>
        <span>{{ post.readTimeMinutes }} min read</span>
      </div>

      <h2 class="blog-card-title">
        <NuxtLink :to="`/blog/${post.slug}`">{{ post.title }}</NuxtLink>
      </h2>

      <p class="blog-card-excerpt">{{ post.description }}</p>

      <div class="blog-card-footer">
        <div class="blog-card-metrics">
          <span v-if="post.views > 0">{{ post.views }} views</span>
          <span v-if="post.reactionCount > 0">❤️ {{ post.reactionCount }}</span>
          <span v-if="post.allowComments && post.commentCount > 0">💬 {{ post.commentCount }}</span>
        </div>
        <NuxtLink :to="`/blog/${post.slug}`" class="blog-card-readmore">
          Read article →
        </NuxtLink>
      </div>
    </div>
  </article>
</template>
