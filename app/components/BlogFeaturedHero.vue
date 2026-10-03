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
  <section v-if="posts && posts.length > 0 && leadPost" class="blog-featured-section" aria-label="Featured Articles">
    <div class="featured-section-header">
      <div class="featured-badge-tag">
        <span class="star-icon">⭐</span>
        <span>Featured Stories</span>
      </div>
      <p class="featured-subtitle">Handpicked articles and deep-dives</p>
    </div>

    <!-- Single Featured Post Layout -->
    <div v-if="posts.length === 1" class="featured-grid layout-single">
      <article class="featured-card primary-card">
        <NuxtLink
          v-if="leadPost.featuredImageUrl"
          :to="`/blog/${leadPost.slug}`"
          class="featured-card-media"
          tabindex="-1"
          aria-hidden="true"
        >
          <img
            :src="leadPost.featuredImageUrl"
            :alt="leadPost.title"
            class="featured-card-img"
          />
        </NuxtLink>

        <div class="featured-card-body">
          <div class="featured-meta">
            <span class="featured-pill">⭐ Featured</span>
            <time>{{ formatDate(leadPost.createdAt) }}</time>
            <span class="meta-dot">·</span>
            <span>{{ leadPost.readTimeMinutes }} min read</span>
          </div>

          <h2 class="featured-title">
            <NuxtLink :to="`/blog/${leadPost.slug}`">
              {{ leadPost.title }}
            </NuxtLink>
          </h2>

          <p class="featured-excerpt">
            {{ leadPost.description }}
          </p>

          <div class="featured-footer">
            <div class="featured-metrics">
              <span v-if="leadPost.views > 0">{{ leadPost.views }} views</span>
              <span v-if="leadPost.reactionCount > 0">❤️ {{ leadPost.reactionCount }}</span>
              <span v-if="leadPost.allowComments && leadPost.commentCount > 0">💬 {{ leadPost.commentCount }}</span>
            </div>
            <NuxtLink :to="`/blog/${leadPost.slug}`" class="featured-cta-btn">
              Read Story →
            </NuxtLink>
          </div>
        </div>
      </article>
    </div>

    <!-- Double Featured Posts Layout -->
    <div v-else-if="posts.length === 2" class="featured-grid layout-double">
      <article
        v-for="post in posts"
        :key="post.id"
        class="featured-card secondary-card"
      >
        <NuxtLink
          v-if="post.featuredImageUrl"
          :to="`/blog/${post.slug}`"
          class="featured-card-media"
          tabindex="-1"
          aria-hidden="true"
        >
          <img
            :src="post.featuredImageUrl"
            :alt="post.title"
            class="featured-card-img"
          />
        </NuxtLink>

        <div class="featured-card-body">
          <div class="featured-meta">
            <span class="featured-pill">⭐ Featured</span>
            <time>{{ formatDate(post.createdAt) }}</time>
            <span class="meta-dot">·</span>
            <span>{{ post.readTimeMinutes }} min read</span>
          </div>

          <h2 class="featured-title">
            <NuxtLink :to="`/blog/${post.slug}`">
              {{ post.title }}
            </NuxtLink>
          </h2>

          <p class="featured-excerpt">
            {{ post.description }}
          </p>

          <div class="featured-footer">
            <div class="featured-metrics">
              <span v-if="post.views > 0">{{ post.views }} views</span>
              <span v-if="post.reactionCount > 0">❤️ {{ post.reactionCount }}</span>
              <span v-if="post.allowComments && post.commentCount > 0">💬 {{ post.commentCount }}</span>
            </div>
            <NuxtLink :to="`/blog/${post.slug}`" class="featured-cta-link">
              Read Story →
            </NuxtLink>
          </div>
        </div>
      </article>
    </div>

    <!-- Triple Featured Posts Layout (1 Primary + 2 Side Stack) -->
    <div v-else class="featured-grid layout-triple">
      <!-- Main Lead Article -->
      <article class="featured-card primary-card">
        <NuxtLink
          v-if="leadPost.featuredImageUrl"
          :to="`/blog/${leadPost.slug}`"
          class="featured-card-media"
          tabindex="-1"
          aria-hidden="true"
        >
          <img
            :src="leadPost.featuredImageUrl"
            :alt="leadPost.title"
            class="featured-card-img"
          />
        </NuxtLink>

        <div class="featured-card-body">
          <div class="featured-meta">
            <span class="featured-pill">⭐ Top Pick</span>
            <time>{{ formatDate(leadPost.createdAt) }}</time>
            <span class="meta-dot">·</span>
            <span>{{ leadPost.readTimeMinutes }} min read</span>
          </div>

          <h2 class="featured-title">
            <NuxtLink :to="`/blog/${leadPost.slug}`">
              {{ leadPost.title }}
            </NuxtLink>
          </h2>

          <p class="featured-excerpt">
            {{ leadPost.description }}
          </p>

          <div class="featured-footer">
            <div class="featured-metrics">
              <span v-if="leadPost.views > 0">{{ leadPost.views }} views</span>
              <span v-if="leadPost.reactionCount > 0">❤️ {{ leadPost.reactionCount }}</span>
              <span v-if="leadPost.allowComments && leadPost.commentCount > 0">💬 {{ leadPost.commentCount }}</span>
            </div>
            <NuxtLink :to="`/blog/${leadPost.slug}`" class="featured-cta-btn">
              Read Story →
            </NuxtLink>
          </div>
        </div>
      </article>

      <!-- 2 Side Stacked Featured Articles -->
      <div class="featured-side-stack">
        <article
          v-for="post in sidePosts"
          :key="post.id"
          class="featured-card side-card"
        >
          <NuxtLink
            v-if="post.featuredImageUrl"
            :to="`/blog/${post.slug}`"
            class="featured-card-media-side"
            tabindex="-1"
            aria-hidden="true"
          >
            <img
              :src="post.featuredImageUrl"
              :alt="post.title"
              class="featured-card-img"
            />
          </NuxtLink>

          <div class="featured-card-body">
            <div class="featured-meta">
              <span class="featured-pill">⭐ Featured</span>
              <time>{{ formatDate(post.createdAt) }}</time>
              <span class="meta-dot">·</span>
              <span>{{ post.readTimeMinutes }} min read</span>
            </div>

            <h3 class="featured-title side-title">
              <NuxtLink :to="`/blog/${post.slug}`">
                {{ post.title }}
              </NuxtLink>
            </h3>

            <p class="featured-excerpt side-excerpt">
              {{ post.description }}
            </p>

            <div class="featured-footer">
              <div class="featured-metrics">
                <span v-if="post.reactionCount > 0">❤️ {{ post.reactionCount }}</span>
                <span v-if="post.allowComments && post.commentCount > 0">💬 {{ post.commentCount }}</span>
              </div>
              <NuxtLink :to="`/blog/${post.slug}`" class="featured-cta-link">
                Read Story →
              </NuxtLink>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
