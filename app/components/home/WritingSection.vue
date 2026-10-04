<script setup lang="ts">
import { computed } from "vue";
import type { BlogPostsResponse } from "@/interfaces/blog";
import { formatDate } from "@/utils/date";

const { data } = await useAsyncData<BlogPostsResponse>("home-featured-posts", () =>
  $fetch<BlogPostsResponse>("/api/posts?limit=3")
);

const featuredPosts = computed(() => {
  if (!data.value) return [];
  return data.value.featured?.length > 0 ? data.value.featured : data.value.posts.slice(0, 3);
});

const totalArticles = computed(() => data.value?.pagination?.total || 0);
</script>

<template>
  <section
    v-if="featuredPosts.length > 0"
    id="writing"
    class="mx-auto w-full max-w-190 pt-[2.2rem] sm:pt-[2.4rem]"
  >
    <div class="mb-[1.1rem] flex flex-col gap-2">
      <p class="text-soft m-0 mb-[0.7rem] text-[0.72rem] font-bold tracking-[0.16em] uppercase">
        Selected Writing
      </p>
      <div class="flex items-baseline justify-between">
        <h2
          class="text-ink m-0 text-[clamp(1.6rem,3vw,2.4rem)] leading-none font-bold tracking-tighter"
        >
          Writing
        </h2>
        <NuxtLink
          to="/blog"
          class="text-soft hover:text-ink text-xs font-semibold tracking-wide transition-colors"
        >
          View all ({{ totalArticles }}) →
        </NuxtLink>
      </div>
    </div>

    <div class="flex flex-col">
      <article
        v-for="post in featuredPosts"
        :key="post.id"
        class="border-line flex flex-col gap-[0.55rem] border-t py-4 last:border-b"
      >
        <div class="flex items-center justify-between text-xs">
          <span v-if="post.category" class="text-ink font-medium">
            {{ post.category.name }}
          </span>
          <div class="text-soft flex items-center gap-1.5 font-mono text-[0.82rem]">
            <span>{{ post.readTimeMinutes }}m read</span>
            <span>·</span>
            <span>{{ formatDate(post.createdAt) }}</span>
          </div>
        </div>

        <div class="flex flex-col gap-[0.35rem]">
          <NuxtLink :to="`/blog/${post.slug}`" class="group">
            <h3
              class="text-ink leading-light m-0 text-[1.08rem] font-bold group-hover:text-white group-hover:underline"
            >
              {{ post.title }}
            </h3>
          </NuxtLink>
          <p class="text-muted m-0 line-clamp-2 text-[0.88rem] leading-[1.45]">
            {{ post.description }}
          </p>
        </div>
      </article>
    </div>
  </section>
</template>
