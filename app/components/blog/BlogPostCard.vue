<script setup lang="ts">
import type { BlogPostSummary } from "@/interfaces/blog";
import { formatDate } from "@/utils/date";

defineProps<{
  post: BlogPostSummary;
}>();
</script>

<template>
  <article
    class="group bg-card border-line hover:border-line-strong hover:bg-card-hover shadow-card flex flex-col overflow-hidden rounded-2xl border transition-all"
  >
    <NuxtLink
      v-if="post.featuredImageUrl"
      :to="`/blog/${post.slug}`"
      class="bg-elevated block aspect-video w-full overflow-hidden"
      tabindex="-1"
      aria-hidden="true"
    >
      <img
        :src="post.featuredImageUrl"
        :alt="post.title"
        class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
    </NuxtLink>

    <div class="flex flex-1 flex-col gap-2.5 p-5">
      <div class="text-soft flex items-center gap-2 text-xs">
        <span
          v-if="post.featured"
          class="rounded-full bg-amber-400/10 px-2 py-0.5 text-[0.65rem] font-bold text-amber-400"
          >⭐ Featured</span
        >
        <time>{{ formatDate(post.createdAt) }}</time>
        <span>·</span>
        <span>{{ post.readTimeMinutes }} min read</span>
      </div>

      <h2
        class="text-ink m-0 line-clamp-2 text-base font-bold transition-colors group-hover:text-white"
      >
        <NuxtLink :to="`/blog/${post.slug}`">{{ post.title }}</NuxtLink>
      </h2>

      <p class="text-muted m-0 line-clamp-3 flex-1 text-xs leading-relaxed">
        {{ post.description }}
      </p>

      <div
        class="border-line/50 text-soft mt-auto flex items-center justify-between border-t pt-3 text-xs"
      >
        <div class="flex items-center gap-3">
          <span v-if="post.views > 0">{{ post.views }} views</span>
          <span v-if="post.reactionCount > 0">❤️ {{ post.reactionCount }}</span>
          <span v-if="post.allowComments && post.commentCount > 0">💬 {{ post.commentCount }}</span>
        </div>
        <NuxtLink :to="`/blog/${post.slug}`" class="text-ink font-medium group-hover:underline">
          Read article →
        </NuxtLink>
      </div>
    </div>
  </article>
</template>
