<script setup lang="ts">
import GitHubIcon from "@/components/icons/GitHubIcon.vue";
import SiteFooter from "@/components/SiteFooter.vue";
import { profileLinks } from "@/constants/about";
import type { GuestbookUser } from "@/interfaces/guestbook";

const route = useRoute();
const isHome = computed(() => route.path === "/");
const isBlog = computed(() => route.path.startsWith("/blog"));
const isGuestbook = computed(() => route.path === "/guestbook");
const isAdmin = computed(() => route.path.startsWith("/admin"));

const { data: authData } = await useAsyncData<{ user: GuestbookUser | null }>(
  "auth-user",
  () => $fetch("/api/auth/me").catch(() => ({ user: null })),
  { default: () => ({ user: null }) }
);

const currentUser = computed(() => authData.value?.user ?? null);

useHead(() => ({
  title: isGuestbook.value
    ? "Guestbook | Solomon Olatunji"
    : isBlog.value
    ? "Blog | Solomon Olatunji"
    : isAdmin.value
    ? "Admin Blog | Solomon Olatunji"
    : "Solomon Olatunji | Portfolio",
  link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
}));

useSeoMeta({
  description: "Solomon Olatunji — software engineer building useful products.",
  ogDescription: "Solomon Olatunji — software engineer building useful products.",
  ogSiteName: "Solomon Olatunji",
  ogType: "website",
  twitterCard: "summary",
});
</script>

<template>
  <main class="portfolio-shell">
    <nav class="site-nav" aria-label="Primary navigation">
      <NuxtLink to="/" class="site-mark">SO<span>/</span>26</NuxtLink>
      <div class="site-nav-links">
        <NuxtLink to="/" :class="{ active: isHome }">Home</NuxtLink>
        <span aria-hidden="true">/</span>
        <NuxtLink to="/blog" :class="{ active: isBlog }">Blog</NuxtLink>
        <span aria-hidden="true">/</span>
        <NuxtLink to="/guestbook" :class="{ active: isGuestbook }">Guestbook</NuxtLink>
        <template v-if="currentUser?.isAdmin">
          <span aria-hidden="true">/</span>
          <NuxtLink to="/admin/blog" :class="{ active: isAdmin }">Admin</NuxtLink>
        </template>
        <a
          :href="profileLinks[0].href"
          class="site-github-link"
          aria-label="Open Solomon's GitHub"
          target="_blank"
          rel="noreferrer"
        >
          <GitHubIcon />
        </a>
      </div>
    </nav>
    <NuxtPage />
    <SiteFooter />
  </main>
</template>
