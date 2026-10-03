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

const { data, status, error } = await useAsyncData(`post-${slug.value}`, async () => {
  return await $fetch<{
    post: BlogPost;
    comments: BlogComment[];
    reactions: BlogReactionsSummary;
  }>(`/api/posts/${slug.value}` as string);
});

const { data: userData } = await useAsyncData("current-user-post", async () => {
  return await $fetch<{ user: GuestbookUser | null }>("/api/auth/me" as string).catch(() => ({
    user: null,
  }));
});

const post = computed(() => data.value?.post);
const comments = computed(() => data.value?.comments || []);
const reactions = computed(
  () =>
    data.value?.reactions || {
      counts: { heart: 0, fire: 0, rocket: 0, like: 0, bulb: 0 },
      userReactions: [],
      total: 0,
    }
);
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
  <div class="mx-auto mt-6 flex w-full max-w-190 flex-col gap-6">
    <div>
      <NuxtLink
        to="/blog"
        class="text-soft hover:text-ink inline-flex items-center text-xs font-semibold transition-colors"
      >
        ← All Articles
      </NuxtLink>
    </div>

    <div v-if="status === 'pending'" class="text-soft py-12 text-center text-sm">
      Loading article...
    </div>

    <div
      v-else-if="error || !post"
      class="text-soft flex flex-col items-center gap-3 py-12 text-center text-sm"
    >
      <p class="m-0">Article not found.</p>
      <NuxtLink
        to="/blog"
        class="bg-ink text-bg inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all hover:opacity-90"
      >
        Return to Blog
      </NuxtLink>
    </div>

    <article v-else class="flex flex-col">
      <!-- Article Header -->
      <header class="border-line/60 flex flex-col gap-3 border-b pb-6">
        <div class="text-soft flex flex-wrap items-center gap-2 text-xs">
          <time>{{ formatDate(post.createdAt) }}</time>
          <span>·</span>
          <span>{{ post.readTimeMinutes }} min read</span>
          <span v-if="post.views > 0">·</span>
          <span v-if="post.views > 0">{{ post.views }} views</span>
          <span
            v-if="!post.published"
            class="rounded-full bg-amber-400/10 px-2 py-0.5 text-[0.65rem] font-bold text-amber-400"
            >Draft Preview</span
          >
        </div>

        <h1 class="text-ink m-0 text-2xl leading-tight font-bold tracking-tight md:text-4xl">
          {{ post.title }}
        </h1>
        <p class="text-muted m-0 text-base leading-relaxed">{{ post.description }}</p>

        <div class="flex items-center gap-3 pt-2">
          <img
            :src="`https://github.com/${siteConfig.adminUsername}.png`"
            :alt="siteConfig.name"
            class="border-line size-10 rounded-full border object-cover"
          />
          <div class="flex flex-col">
            <strong class="text-ink text-sm leading-none font-semibold">{{
              siteConfig.name
            }}</strong>
            <span class="text-soft text-xs">@{{ siteConfig.adminUsername }}</span>
          </div>
        </div>
      </header>

      <!-- Featured Image Banner -->
      <div v-if="post.featuredImageUrl" class="border-line my-6 overflow-hidden rounded-2xl border">
        <img
          :src="post.featuredImageUrl"
          :alt="post.title"
          class="max-h-[420px] w-full object-cover"
        />
      </div>

      <!-- Markdown Content Body -->
      <BlogProse :content="htmlContent" />

      <!-- Reaction Bar (Available for all posts) -->
      <div class="border-line/60 my-6 border-y py-6">
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
