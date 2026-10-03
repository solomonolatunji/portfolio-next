<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { BlogPostSummary, BlogPostsResponse } from "@/interfaces/blog";
import type { GuestbookUser } from "@/interfaces/guestbook";
import BlogFeaturedHero from "@/components/BlogFeaturedHero.vue";
import BlogPostCard from "@/components/BlogPostCard.vue";
import BlogPagination from "@/components/BlogPagination.vue";
const siteConfig = useSiteConfig();

useHead({
  title: siteConfig.pageTitle("Blog"),
  meta: [
    {
      name: "description",
      content: "Articles, insights, and thoughts on technology, software engineering, architecture, and building products.",
    },
  ],
});

const route = useRoute();
const router = useRouter();

const currentPage = ref(Number(route.query.page) || 1);
const searchQuery = ref(typeof route.query.search === "string" ? route.query.search : "");
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

const { data: postsData, status, refresh } = await useAsyncData(
  "blog-posts",
  async () => {
    const params = new URLSearchParams();
    params.set("page", String(currentPage.value));
    params.set("limit", "6");
    if (searchQuery.value.trim()) {
      params.set("search", searchQuery.value.trim());
    }
    return await $fetch<BlogPostsResponse>(`/api/posts?${params.toString()}`);
  },
  {
    watch: [currentPage],
  }
);

const { data: userData } = await useAsyncData(
  "current-user-blog",
  async () => {
    return await $fetch<{ user: GuestbookUser | null }>("/api/auth/me" as string).catch(() => ({ user: null }));
  }
);

const featuredPosts = computed(() => postsData.value?.featured || []);
const posts = computed(() => postsData.value?.posts || []);
const pagination = computed(() => postsData.value?.pagination || { page: 1, limit: 6, total: 0, totalPages: 1 });
const currentUser = computed(() => userData.value?.user || null);

function onSearchInput() {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    currentPage.value = 1;
    router.replace({
      query: {
        ...route.query,
        page: undefined,
        search: searchQuery.value.trim() || undefined,
      },
    });
    refresh();
  }, 350);
}

function clearSearch() {
  searchQuery.value = "";
  currentPage.value = 1;
  router.replace({
    query: {
      ...route.query,
      page: undefined,
      search: undefined,
    },
  });
  refresh();
}

function onPageChange(newPage: number) {
  currentPage.value = newPage;
  router.push({
    query: {
      ...route.query,
      page: newPage > 1 ? String(newPage) : undefined,
    },
  });
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
</script>

<template>
  <div class="blog-index-page">
    <!-- Header Section -->
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

    <!-- Featured Hero Section (Top 3 max) -->
    <BlogFeaturedHero
      v-if="featuredPosts.length > 0 && currentPage === 1 && !searchQuery.trim()"
      :posts="featuredPosts"
    />

    <!-- Search & Filter Controls -->
    <div class="blog-controls-bar">
      <div class="blog-search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search articles by title, description or content..."
          class="guestbook-input search-input"
          @input="onSearchInput"
        />
        <button
          v-if="searchQuery"
          type="button"
          class="search-clear-btn"
          title="Clear search"
          @click="clearSearch"
        >
          ✕
        </button>
      </div>

      <div v-if="searchQuery.trim()" class="search-active-notice">
        Showing results for "<strong>{{ searchQuery }}</strong>"
        <button type="button" class="text-link-btn" @click="clearSearch">Clear</button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="status === 'pending'" class="guestbook-empty">
      <p>Loading articles...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="posts.length === 0" class="guestbook-empty">
      <p v-if="searchQuery">No articles matching "{{ searchQuery }}".</p>
      <p v-else>No articles published yet. Check back soon!</p>
      <button
        v-if="searchQuery"
        type="button"
        class="guestbook-button secondary mt-4 inline-flex"
        @click="clearSearch"
      >
        Clear Search Filter
      </button>
    </div>

    <!-- Articles Grid & Pagination -->
    <div v-else class="blog-main-content">
      <div class="blog-posts-grid">
        <BlogPostCard
          v-for="post in posts"
          :key="post.id"
          :post="post"
        />
      </div>

      <!-- Pagination Component -->
      <BlogPagination
        :current-page="pagination.page"
        :total-pages="pagination.totalPages"
        @update:page="onPageChange"
      />
    </div>
  </div>
</template>
