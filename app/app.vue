<script setup lang="ts">
import GitHubIcon from "@/components/icons/GitHubIcon.vue";
import SiteFooter from "@/components/layout/SiteFooter.vue";
import { profileLinks } from "@/constants/about";
import type { GuestbookUser } from "@/interfaces/guestbook";
const siteConfig = usePortfolioConfig();
const requestFetch = useRequestFetch();

const route = useRoute();
const isHome = computed(() => route.path === "/");
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
    <nav
      class="text-soft mx-auto flex w-full max-w-190 items-center justify-between gap-[0.65rem] text-[0.7rem] font-bold tracking-[0.16em] uppercase"
      aria-label="Primary navigation"
    >
      <NuxtLink to="/" class="text-ink text-[0.76rem] tracking-[0.08em]">
        {{ siteConfig.shortName }}<span class="text-soft mx-[0.2rem]">/</span>26
      </NuxtLink>
      <div class="flex items-center gap-[0.65rem]">
        <NuxtLink
          to="/"
          class="hover:text-ink transition-colors duration-150"
          :class="{ 'text-ink': isHome }"
          >Home
        </NuxtLink>
        <span aria-hidden="true">/</span>
        <NuxtLink
          to="/blog"
          class="hover:text-ink transition-colors duration-150"
          :class="{ 'text-ink': isBlog }"
          >Blog
        </NuxtLink>
        <span aria-hidden="true">/</span>
        <NuxtLink
          to="/guestbook"
          class="hover:text-ink transition-colors duration-150"
          :class="{ 'text-ink': isGuestbook }"
          >Guestbook</NuxtLink
        >
        <template v-if="currentUser?.isAdmin">
          <span aria-hidden="true">/</span>
          <NuxtLink
            to="/admin/blog"
            class="hover:text-ink transition-colors duration-150"
            :class="{ 'text-ink': isAdmin }"
            >Admin</NuxtLink
          >
        </template>
        <a
          :href="profileLinks[0].href"
          class="border-line text-muted hover:border-line-strong hover:text-ink ml-[0.35rem] inline-flex size-8 items-center justify-center rounded-full border transition-all [&_svg]:size-[0.95rem] [&_svg]:fill-current"
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
