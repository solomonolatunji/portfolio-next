<script setup lang="ts">
import GitHubIcon from "@/components/icons/GitHubIcon.vue";
import SiteFooter from "@/components/SiteFooter.vue";
import { profileLinks } from "@/constants/about";

const route = useRoute();
const isGuestbook = computed(() => route.path === "/guestbook");

useHead(() => ({
  title: isGuestbook.value ? "Guestbook | Solomon Olatunji" : "Solomon Olatunji | Portfolio",
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
        <NuxtLink to="/" :class="{ active: !isGuestbook }">Home</NuxtLink>
        <span aria-hidden="true">/</span>
        <NuxtLink to="/guestbook" :class="{ active: isGuestbook }">Guestbook</NuxtLink>
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
