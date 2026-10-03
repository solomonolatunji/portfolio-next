<script setup lang="ts">
import { computed, ref } from "vue";
import GitHubIcon from "@/components/icons/GitHubIcon.vue";
import type { GuestbookUser } from "@/interfaces/guestbook";

const siteConfig = usePortfolioConfig();
const route = useRoute();
const router = useRouter();
const requestFetch = useRequestFetch();

useHead({
  title: siteConfig.pageTitle("Admin Studio Login"),
});

const redirectPath = computed(() => {
  const r = route.query.redirect;
  return typeof r === "string" && r.startsWith("/") && !r.startsWith("//") ? r : "/admin/blog";
});

const { data: authData, refresh } = await useAsyncData("admin-login-auth", async () => {
  return await requestFetch<{ user: GuestbookUser | null }>("/api/auth/me").catch(() => ({
    user: null,
  }));
});

const user = computed(() => authData.value?.user ?? null);
const isDev = import.meta.dev;
const isLoggingIn = ref(false);
const error = ref("");

if (user.value?.isAdmin) {
  await navigateTo(redirectPath.value);
}

async function handleDevLogin() {
  isLoggingIn.value = true;
  error.value = "";
  try {
    await $fetch("/api/auth/dev-login", { method: "POST" });
    await refresh();
    await navigateTo(redirectPath.value);
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : "Failed to log in via dev auth.";
  } finally {
    isLoggingIn.value = false;
  }
}

async function handleSignOut() {
  await $fetch("/api/auth/logout", { method: "POST" });
  await refresh();
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-md flex-col items-center justify-center py-16">
    <div class="border-line bg-card/80 shadow-card w-full rounded-2xl border p-8 backdrop-blur-xs">
      <div class="mb-6 flex flex-col items-center text-center">
        <div
          class="border-line bg-elevated mb-3 flex size-12 items-center justify-center rounded-2xl border text-2xl shadow-xs"
        >
          🔐
        </div>
        <h1 class="text-ink text-2xl font-bold tracking-tight">Admin Studio</h1>
        <p class="text-muted mt-1.5 text-xs leading-relaxed">
          Sign in with your administrator GitHub account to manage articles, drafts, and engagement.
        </p>
      </div>

      <UAlert v-if="error" color="error" variant="subtle" :title="error" class="mb-4" />

      <!-- Logged in but not admin -->
      <div v-if="user && !user.isAdmin" class="flex flex-col gap-4 text-center">
        <div
          class="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs text-amber-300"
        >
          <p class="font-semibold">Access Restricted</p>
          <p class="text-soft mt-1">
            Signed in as <strong class="text-amber-200">@{{ user.username }}</strong
            >, which does not have administrator access.
          </p>
        </div>

        <div class="flex flex-col gap-2">
          <a
            :href="`/api/auth/github?redirect=${encodeURIComponent(redirectPath)}`"
            class="bg-ink text-bg flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-opacity hover:opacity-90"
            rel="external"
          >
            <GitHubIcon class="size-4 fill-current" />
            Switch GitHub Account
          </a>
          <UButton color="neutral" variant="ghost" size="sm" @click="handleSignOut">
            Sign out
          </UButton>
        </div>
      </div>

      <!-- Not logged in -->
      <div v-else class="flex flex-col gap-3">
        <a
          :href="`/api/auth/github?redirect=${encodeURIComponent(redirectPath)}`"
          class="bg-ink text-bg flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold transition-all hover:opacity-90 active:scale-98"
          rel="external"
        >
          <GitHubIcon class="size-4 fill-current" />
          Sign in with GitHub
        </a>

        <!-- Dev Mode 1-Click Login -->
        <button
          v-if="isDev"
          type="button"
          class="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
          :disabled="isLoggingIn"
          @click="handleDevLogin"
        >
          ⚡ Dev 1-Click Admin Login (Localhost)
        </button>

        <div class="mt-4 text-center">
          <NuxtLink to="/blog" class="text-soft hover:text-ink text-xs transition-colors">
            ← Return to Blog
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
