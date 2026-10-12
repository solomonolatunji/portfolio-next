<script setup lang="ts">
import SiteFooter from "@/components/layout/SiteFooter.vue";
import SiteHeader from "@/components/layout/SiteHeader.vue";
import type { GuestbookUser } from "@/interfaces/guestbook";
const siteConfig = usePortfolioConfig();
const requestFetch = useRequestFetch();

const route = useRoute();
const isBlog = computed(() => route.path.startsWith("/blog"));
const isGuestbook = computed(() => route.path === "/guestbook");
const isAdmin = computed(() => route.path.startsWith("/admin"));

const { data: authData } = await useAsyncData(
  "auth-user",
  async () => {
    return await requestFetch<{ user: GuestbookUser | null }>("/api/auth/me" as string).catch(
      () => ({
        user: null,
      })
    );
  },
  { default: () => ({ user: null }) }
);

const currentUser = computed(() => authData.value?.user ?? null);

useHead(() => ({
  title: isGuestbook.value
    ? siteConfig.pageTitle("Guestbook")
    : isBlog.value
      ? siteConfig.pageTitle("Blog")
      : isAdmin.value
        ? siteConfig.pageTitle("Admin Blog")
        : siteConfig.pageTitle(),
  link: [
    { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
    {
      rel: "alternate",
      type: "application/rss+xml",
      title: siteConfig.name,
      href: "/rss.xml",
    },
  ],
}));

useSeoMeta({
  description: siteConfig.description,
  ogDescription: siteConfig.description,
  ogSiteName: siteConfig.name,
  ogType: "website",
});
</script>

<template>
  <main
    class="mx-auto flex min-h-dvh w-[min(calc(100%-1.25rem),1100px)] flex-1 flex-col pt-[1.35rem] pb-[2.4rem] sm:w-[min(980px,calc(100%-2rem))] sm:pt-[2.2rem] sm:pb-[2.8rem]"
  >
    <SiteHeader :is-admin="currentUser?.isAdmin ?? false" />
    <NuxtPage />
    <SiteFooter />
  </main>
</template>
