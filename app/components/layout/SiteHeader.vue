<script setup lang="ts">
import GitHubIcon from "@/components/icons/GitHubIcon.vue";
import { profileLinks } from "@/constants/about";

const props = defineProps<{ isAdmin: boolean }>();

const route = useRoute();
const menuOpen = ref(false);

const githubHref = profileLinks[0].href;

const navLinks = computed(() => {
  const links = [
    { to: "/", label: "Home", active: route.path === "/" },
    { to: "/blog", label: "Blog", active: route.path.startsWith("/blog") },
    { to: "/guestbook", label: "Guestbook", active: route.path === "/guestbook" },
  ];
  if (props.isAdmin) {
    links.push({ to: "/admin/blog", label: "Admin", active: route.path.startsWith("/admin") });
  }
  return links;
});

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false;
  }
);
</script>

<template>
  <header class="mx-auto w-full max-w-190">
    <nav
      class="text-soft flex w-full items-center justify-between gap-[0.65rem] text-[0.7rem] font-bold tracking-[0.16em] uppercase"
      aria-label="Primary navigation"
      @keydown.escape="menuOpen = false"
    >
      <div class="hidden items-center gap-[0.65rem] sm:flex">
        <template v-for="(link, index) in navLinks" :key="link.to">
          <span v-if="index > 0" aria-hidden="true">/</span>
          <NuxtLink
            :to="link.to"
            class="hover:text-ink transition-colors duration-150"
            :class="{ 'text-ink': link.active }"
            >{{ link.label }}
          </NuxtLink>
        </template>
      </div>
      <div class="flex items-center sm:hidden">
        <button
          type="button"
          class="border-line text-muted hover:border-line-strong hover:text-ink inline-flex size-8 items-center justify-center rounded-full border transition-all"
          :aria-expanded="menuOpen"
          aria-controls="mobile-menu"
          aria-label="Toggle navigation menu"
          @click="menuOpen = !menuOpen"
        >
          <svg
            viewBox="0 0 16 16"
            class="size-4"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            aria-hidden="true"
          >
            <path v-if="!menuOpen" d="M2 4.5h12M2 8h12M2 11.5h12" stroke-linecap="round" />
            <path v-else d="M4 4l8 8M12 4l-8 8" stroke-linecap="round" />
          </svg>
        </button>
      </div>
      <a
        :href="githubHref"
        class="border-line text-muted hover:border-line-strong hover:text-ink inline-flex size-8 items-center justify-center rounded-full border transition-all [&_svg]:size-[0.95rem] [&_svg]:fill-current"
        aria-label="Open Solomon's GitHub"
        target="_blank"
        rel="noreferrer"
      >
        <GitHubIcon />
      </a>
    </nav>
    <div
      v-if="menuOpen"
      id="mobile-menu"
      class="border-line bg-elevated mt-3 rounded-xl border p-2 sm:hidden"
    >
      <NuxtLink
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        class="text-soft hover:text-ink hover:bg-chip block rounded-lg px-3 py-2.5 text-[0.72rem] font-bold tracking-[0.16em] uppercase transition-colors duration-150"
        :class="{ 'text-ink bg-chip': link.active }"
        >{{ link.label }}
      </NuxtLink>
    </div>
  </header>
</template>
