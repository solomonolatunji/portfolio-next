<script setup lang="ts">
import GitHubIcon from "@/components/icons/GitHubIcon.vue";
import SiteFooter from "@/components/SiteFooter.vue";
import { profileLinks } from "@/constants/about";
import { siteConfig, formatPageTitle } from "@/constants/site";
import type { GuestbookUser } from "@/interfaces/guestbook";

const route = useRoute();
const isHome = computed(() => route.path === "/");
const isBlog = computed(() => route.path.startsWith("/blog"));
const isGuestbook = computed(() => route.path === "/guestbook");
const isAdmin = computed(() => route.path.startsWith("/admin"));

const { data: authData } = await useAsyncData(
  "auth-user",
  async () => {
    return await $fetch<{ user: GuestbookUser | null }>("/api/auth/me" as string).catch(() => ({ user: null }));
  },
  { default: () => ({ user: null }) }
);

const currentUser = computed(() => authData.value?.user ?? null);

useHead(() => ({
  title: isGuestbook.value
    ? formatPageTitle("Guestbook")
    : isBlog.value
    ? formatPageTitle("Blog")
    : isAdmin.value
    ? formatPageTitle("Admin Blog")
    : formatPageTitle(),
  link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
}));

useSeoMeta({
  description: siteConfig.description,
  ogDescription: siteConfig.description,
  ogSiteName: siteConfig.name,
  ogType: "website",
  twitterCard: "summary",
});
</script>

<template>
  <main class="portfolio-shell">
    <nav class="site-nav" aria-label="Primary navigation">
      <NuxtLink to="/" class="site-mark">{{ siteConfig.shortName }}<span>/</span>26</NuxtLink>
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
