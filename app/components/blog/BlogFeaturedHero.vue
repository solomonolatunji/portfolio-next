<script setup lang="ts">
import { computed } from "vue";
import type { BlogPostSummary } from "@/interfaces/blog";
import { formatDate } from "@/utils/date";

const props = defineProps<{
  posts: BlogPostSummary[];
}>();

const leadPost = computed<BlogPostSummary | null>(() => props.posts[0] ?? null);
const sidePosts = computed<BlogPostSummary[]>(() => props.posts.slice(1, 3));
</script>

<template>
  <section
    v-if="posts && posts.length > 0 && leadPost"
    class="mb-11 flex flex-col gap-5"
    aria-label="Featured Articles"
  >
    <div class="border-line flex flex-wrap items-center justify-between gap-2 border-b pb-3">
      <div
        class="text-ink inline-flex items-center gap-1.5 text-[0.85rem] font-bold tracking-wide uppercase"
      >
        <span>⭐</span>
        <span>Featured Stories</span>
      </div>
      <p class="text-soft m-0 text-[0.82rem]">Handpicked articles and deep-dives</p>
    </div>

    <!-- Single Featured Post Layout -->
    <div v-if="posts.length === 1">
      <article
        class="group bg-card border-line hover:border-line-strong hover:bg-card-hover shadow-card grid grid-cols-1 items-center gap-6 overflow-hidden rounded-2xl border p-6 transition-all md:grid-cols-2"
      >
        <NuxtLink
          v-if="leadPost.featuredImageUrl"
          :to="`/blog/${leadPost.slug}`"
          class="bg-elevated block aspect-video w-full overflow-hidden rounded-xl"
          tabindex="-1"
          aria-hidden="true"
        >
          <img
            :src="leadPost.featuredImageUrl"
            :alt="leadPost.title"
            class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </NuxtLink>

        <div class="flex flex-col gap-3">
          <div class="text-soft flex items-center gap-2 text-xs">
            <span
              class="rounded-full bg-amber-400/10 px-2 py-0.5 text-[0.65rem] font-bold text-amber-400"
              >⭐ Featured</span
            >
            <time>{{ formatDate(leadPost.createdAt) }}</time>
            <span>·</span>
            <span>{{ leadPost.readTimeMinutes }} min read</span>
          </div>

          <h2
            class="text-ink m-0 line-clamp-2 text-xl font-bold transition-colors group-hover:text-white"
          >
            <NuxtLink :to="`/blog/${leadPost.slug}`">
              {{ leadPost.title }}
            </NuxtLink>
          </h2>

          <p class="text-muted m-0 line-clamp-3 text-sm leading-relaxed">
            {{ leadPost.description }}
          </p>

          <div
            class="border-line/50 text-soft mt-4 flex items-center justify-between border-t pt-3 text-xs"
          >
            <div class="flex items-center gap-3">
              <span v-if="leadPost.views > 0">{{ leadPost.views }} views</span>
              <span v-if="leadPost.reactionCount > 0">❤️ {{ leadPost.reactionCount }}</span>
              <span v-if="leadPost.allowComments && leadPost.commentCount > 0"
                >💬 {{ leadPost.commentCount }}</span
              >
            </div>
            <NuxtLink
              :to="`/blog/${leadPost.slug}`"
              class="bg-ink text-bg inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-90"
            >
              Read Story →
            </NuxtLink>
          </div>
        </div>
      </article>
    </div>

    <!-- Double Featured Posts Layout -->
    <div v-else-if="posts.length === 2" class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <article
        v-for="post in posts"
        :key="post.id"
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
          />
        </NuxtLink>

        <div class="flex flex-1 flex-col gap-2.5 p-5">
          <div class="text-soft flex items-center gap-2 text-xs">
            <span
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
            <NuxtLink :to="`/blog/${post.slug}`">
              {{ post.title }}
            </NuxtLink>
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
              <span v-if="post.allowComments && post.commentCount > 0"
                >💬 {{ post.commentCount }}</span
              >
            </div>
            <NuxtLink :to="`/blog/${post.slug}`" class="text-ink font-medium group-hover:underline">
              Read Story →
            </NuxtLink>
          </div>
        </div>
      </article>
    </div>

    <!-- Triple Featured Posts Layout (1 Primary + 2 Side Stack) -->
    <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-[1.2fr_1fr]">
      <!-- Main Lead Article -->
      <article
        class="group bg-card from-card hover:border-line-strong hover:bg-card-hover flex flex-col overflow-hidden rounded-[14px] border border-amber-500/25 bg-linear-to-b to-white/[0.02] transition-all"
      >
        <NuxtLink
          v-if="leadPost.featuredImageUrl"
          :to="`/blog/${leadPost.slug}`"
          class="bg-elevated block aspect-video w-full overflow-hidden"
          tabindex="-1"
          aria-hidden="true"
        >
          <img
            :src="leadPost.featuredImageUrl"
            :alt="leadPost.title"
            class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </NuxtLink>

        <div class="flex flex-1 flex-col gap-2.5 p-5">
          <div class="text-soft flex items-center gap-2 text-xs">
            <span
              class="rounded-full bg-amber-400/10 px-2 py-0.5 text-[0.65rem] font-bold text-amber-400"
              >⭐ Top Pick</span
            >
            <time>{{ formatDate(leadPost.createdAt) }}</time>
            <span>·</span>
            <span>{{ leadPost.readTimeMinutes }} min read</span>
          </div>

          <h2
            class="text-ink m-0 line-clamp-2 text-lg font-bold transition-colors group-hover:text-white"
          >
            <NuxtLink :to="`/blog/${leadPost.slug}`">
              {{ leadPost.title }}
            </NuxtLink>
          </h2>

          <p class="text-muted m-0 line-clamp-3 flex-1 text-xs leading-relaxed">
            {{ leadPost.description }}
          </p>

          <div
            class="border-line/50 text-soft mt-auto flex items-center justify-between border-t pt-3 text-xs"
          >
            <div class="flex items-center gap-3">
              <span v-if="leadPost.views > 0">{{ leadPost.views }} views</span>
              <span v-if="leadPost.reactionCount > 0">❤️ {{ leadPost.reactionCount }}</span>
              <span v-if="leadPost.allowComments && leadPost.commentCount > 0"
                >💬 {{ leadPost.commentCount }}</span
              >
            </div>
            <NuxtLink
              :to="`/blog/${leadPost.slug}`"
              class="bg-ink text-bg inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-90"
            >
              Read Story →
            </NuxtLink>
          </div>
        </div>
      </article>

      <!-- 2 Side Stacked Featured Articles -->
      <div class="flex flex-col gap-5">
        <article
          v-for="post in sidePosts"
          :key="post.id"
          class="group bg-card border-line hover:border-line-strong hover:bg-card-hover flex flex-1 flex-col overflow-hidden rounded-[14px] border p-4 transition-all"
        >
          <div class="flex flex-1 flex-col gap-2">
            <div class="text-soft flex items-center gap-2 text-xs">
              <span
                class="rounded-full bg-amber-400/10 px-2 py-0.5 text-[0.65rem] font-bold text-amber-400"
                >⭐ Featured</span
              >
              <time>{{ formatDate(post.createdAt) }}</time>
              <span>·</span>
              <span>{{ post.readTimeMinutes }} min read</span>
            </div>

            <h3
              class="text-ink m-0 line-clamp-2 text-sm font-bold transition-colors group-hover:text-white"
            >
              <NuxtLink :to="`/blog/${post.slug}`">
                {{ post.title }}
              </NuxtLink>
            </h3>

            <p class="text-muted m-0 line-clamp-2 flex-1 text-xs leading-relaxed">
              {{ post.description }}
            </p>

            <div
              class="border-line/50 text-soft mt-auto flex items-center justify-between border-t pt-2 text-xs"
            >
              <div class="flex items-center gap-3">
                <span v-if="post.reactionCount > 0">❤️ {{ post.reactionCount }}</span>
                <span v-if="post.allowComments && post.commentCount > 0"
                  >💬 {{ post.commentCount }}</span
                >
              </div>
              <NuxtLink
                :to="`/blog/${post.slug}`"
                class="text-ink font-medium group-hover:underline"
              >
                Read Story →
              </NuxtLink>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
