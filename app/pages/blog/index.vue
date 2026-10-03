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
      content:
        "Articles, insights, and thoughts on technology, software engineering, architecture, and building products.",
    },
  ],
});

const route = useRoute();
const router = useRouter();

const currentPage = ref(Number(route.query.page) || 1);
const searchQuery = ref(typeof route.query.search === "string" ? route.query.search : "");
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

const {
  data: postsData,
  status,
  refresh,
} = await useAsyncData(
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

const { data: userData } = await useAsyncData("current-user-blog", async () => {
  return await $fetch<{ user: GuestbookUser | null }>("/api/auth/me" as string).catch(() => ({
    user: null,
  }));
});

const featuredPosts = computed(() => postsData.value?.featured || []);
const posts = computed(() => postsData.value?.posts || []);
const pagination = computed(
  () => postsData.value?.pagination || { page: 1, limit: 6, total: 0, totalPages: 1 }
);
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
  <div class="mx-auto mt-6 flex w-full max-w-190 flex-col gap-8">
    <!-- Header Section -->
    <div class="flex flex-col gap-2">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p class="text-soft m-0 text-[0.72rem] font-bold tracking-[0.16em] uppercase">
            Writing & Insights
          </p>
          <h1 class="text-ink m-0 text-3xl font-bold tracking-tight">Blog</h1>
          <p class="text-muted m-0 mt-1 text-sm">
            Notes on software engineering, architecture, systems design, and building things.
          </p>
        </div>
        <div v-if="currentUser?.isAdmin">
          <NuxtLink
            to="/admin/blog/new"
            class="bg-ink text-bg inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all hover:opacity-90"
          >
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
    <div class="flex flex-col gap-2">
      <div class="relative w-full">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search articles by title, description or content..."
          class="bg-card border-line text-ink placeholder:text-soft focus:border-line-strong w-full rounded-xl border px-4 py-2.5 text-sm transition-colors focus:outline-none"
          @input="onSearchInput"
        />
        <button
          v-if="searchQuery"
          type="button"
          class="text-soft hover:text-ink absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer border-none bg-transparent p-1 text-xs"
          title="Clear search"
          @click="clearSearch"
        >
          ✕
        </button>
      </div>

      <div v-if="searchQuery.trim()" class="text-muted flex items-center gap-2 text-xs">
        Showing results for "<strong>{{ searchQuery }}</strong
        >"
        <button
          type="button"
          class="text-soft hover:text-ink cursor-pointer border-none bg-transparent p-0 text-xs underline"
          @click="clearSearch"
        >
          Clear
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="status === 'pending'" class="text-soft py-12 text-center text-sm">
      <p class="m-0">Loading articles...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="posts.length === 0" class="text-soft py-12 text-center text-sm">
      <p v-if="searchQuery" class="m-0">No articles matching "{{ searchQuery }}".</p>
      <p v-else class="m-0">No articles published yet. Check back soon!</p>
      <button
        v-if="searchQuery"
        type="button"
        class="bg-card border-line text-ink hover:border-line-strong mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs font-medium transition-all"
        @click="clearSearch"
      >
        Clear Search Filter
      </button>
    </div>

    <!-- Articles Grid & Pagination -->
    <div v-else class="flex flex-col gap-8">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <BlogPostCard v-for="post in posts" :key="post.id" :post="post" />
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
