<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import GitHubIcon from "@/components/icons/GitHubIcon.vue";
import LogOutIcon from "@/components/icons/LogOutIcon.vue";
import SignaturePad from "@/components/guestbook/SignaturePad.vue";
import GuestbookNote from "@/components/guestbook/GuestbookNote.vue";
import type { GuestbookEntry, GuestbookUser } from "@/interfaces/guestbook";
import { formatDate } from "@/utils/date";

const user = ref<GuestbookUser | null>(null);
const entries = ref<GuestbookEntry[]>([]);
const userEntry = computed(() => {
  if (!user.value) return null;
  return (
    entries.value.find((e) =>
      e.userId ? e.userId === user.value?.id : e.username === user.value?.username
    ) || null
  );
});
const message = ref("");
const signature = ref("");
const signaturePadRef = ref<InstanceType<typeof SignaturePad> | null>(null);
const loading = ref(true);
const submitting = ref(false);
const error = ref("");
const route = useRoute();
const oauthError = computed(() => (typeof route.query.error === "string" ? route.query.error : ""));
if (oauthError.value) error.value = oauthError.value;

async function request<T>(url: string, options?: Parameters<typeof $fetch>[1]) {
  return $fetch<T>(url, { timeout: 8000, ...options });
}

async function loadGuestbook() {
  loading.value = true;
  error.value = "";
  try {
    const [sessionResult, guestbookResult] = await Promise.allSettled([
      request<{ user: GuestbookUser | null }>("/api/auth/me"),
      request<{ entries: GuestbookEntry[] }>("/api/guestbook"),
    ]);

    if (sessionResult.status === "fulfilled") {
      user.value = sessionResult.value.user;
    } else {
      user.value = null;
    }

    if (guestbookResult.status === "fulfilled") {
      entries.value = guestbookResult.value.entries;
    } else {
      error.value =
        guestbookResult.reason instanceof Error
          ? guestbookResult.reason.message
          : "Unable to load guestbook entries.";
    }
  } finally {
    loading.value = false;
  }
}

const signingOut = ref(false);

async function signOut() {
  if (signingOut.value) return;
  signingOut.value = true;
  try {
    await request("/api/auth/logout", { method: "POST" });
    user.value = null;
  } finally {
    signingOut.value = false;
  }
}

async function submitMessage() {
  const messageToSend = message.value.trim();
  if (!messageToSend || submitting.value) return;
  submitting.value = true;
  error.value = "";
  try {
    await request("/api/guestbook", {
      method: "POST",
      body: {
        message: messageToSend,
        signature: signature.value || undefined,
      },
    });
    if (message.value.trim() === messageToSend) {
      message.value = "";
      signature.value = "";
      signaturePadRef.value?.clear();
    }
    await loadGuestbook();
  } catch (submitError: unknown) {
    error.value =
      submitError instanceof Error ? submitError.message : "Unable to save your message.";
  } finally {
    submitting.value = false;
  }
}

onMounted(loadGuestbook);
</script>

<template>
  <section class="mx-auto mt-6 w-full max-w-190">
    <div class="mb-8">
      <p class="text-soft mb-1.5 text-[0.72rem] font-bold tracking-[0.16em] uppercase">
        A note from the internet
      </p>
      <h1 class="text-ink m-0 text-3xl font-bold tracking-tight">Guestbook</h1>
      <p class="text-muted m-0 mt-2 text-sm">
        Leave a kind word, share what you’re building, or just say hello.
      </p>
    </div>

    <div
      v-if="!loading && user"
      class="bg-card border-line shadow-card mb-8 rounded-2xl border p-5"
    >
      <div class="mb-4 flex items-center gap-3">
        <UAvatar v-if="user.avatarUrl" :src="user.avatarUrl" :alt="user.username" size="md" />
        <div class="flex flex-1 items-center justify-between">
          <div>
            <strong class="text-ink text-sm font-semibold">{{ user.username }}</strong>
            <p v-if="userEntry" class="text-soft mt-0.5 text-xs">
              You've already signed the guestbook ✨
            </p>
          </div>
          <button
            type="button"
            class="text-soft inline-flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 text-xs transition-colors hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="signingOut"
            @click="signOut"
          >
            <span
              v-if="signingOut"
              class="inline-block size-3 animate-spin rounded-full border border-current border-t-transparent"
            />
            <LogOutIcon v-else class="size-3.5 fill-current" />
            {{ signingOut ? "Signing out..." : "Sign out" }}
          </button>
        </div>
      </div>

      <div v-if="userEntry" class="border-line/60 bg-elevated/60 rounded-xl border p-4">
        <p class="text-muted mb-2 text-xs">
          Each user is entitled to one guestbook note. Here is yours:
        </p>
        <GuestbookNote :entry="userEntry" class="border-line/40 bg-card" />
      </div>

      <form v-else class="flex flex-col gap-4" @submit.prevent="submitMessage">
        <UFormField label="Message" name="message" required>
          <UTextarea
            v-model="message"
            :disabled="submitting"
            class="w-full"
            placeholder="Write something nice..."
            :maxlength="500"
            :rows="4"
            autoresize
          />
        </UFormField>
        <SignaturePad ref="signaturePadRef" v-model="signature" :disabled="submitting" />
        <UButton type="submit" :loading="submitting" :disabled="!message.trim()" class="self-start">
          Sign guestbook
        </UButton>
      </form>
    </div>

    <div
      v-else-if="!loading"
      class="border-line mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-[0.85rem] border bg-[rgba(12,12,12,0.7)] p-4"
    >
      <p class="text-muted m-0 text-[0.9rem]">Want to leave a message?</p>
      <a
        href="/api/auth/github"
        class="border-line-strong text-[#080808] bg-ink hover:opacity-90 inline-flex min-h-[2.45rem] items-center justify-center gap-1.5 rounded-[0.55rem] border px-[0.85rem] py-[0.55rem] text-[0.78rem] font-bold transition-transform hover:-translate-y-px [&_svg]:size-4 [&_svg]:fill-current"
        rel="external"
      >
        <GitHubIcon />
        Sign in with GitHub
      </a>
    </div>

    <p v-if="error" class="mb-4 text-xs text-red-400" role="alert">{{ error }}</p>
    <p v-if="loading" class="text-soft py-8 text-center text-sm">Loading messages...</p>
    <p v-else-if="!entries.length" class="text-soft py-8 text-center text-sm">
      No messages yet. Be the first to sign!
    </p>

    <div v-else class="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
      <GuestbookNote v-for="entry in entries" :key="entry.id" :entry="entry" />
    </div>
  </section>
</template>
