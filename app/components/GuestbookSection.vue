<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import GitHubIcon from "@/components/icons/GitHubIcon.vue";
import LogOutIcon from "@/components/icons/LogOutIcon.vue";

interface User {
  id: string;
  username: string;
  avatarUrl: string | null;
  profileUrl: string;
}

interface Entry {
  id: number;
  message: string;
  createdAt: string;
  username: string;
  avatarUrl: string | null;
  profileUrl: string;
}

const user = ref<User | null>(null);
const entries = ref<Entry[]>([]);
const message = ref("");
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
      request<{ user: User | null }>("/api/auth/me"),
      request<{ entries: Entry[] }>("/api/guestbook"),
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

async function signOut() {
  await request("/api/auth/logout", { method: "POST" });
  user.value = null;
}

async function submitMessage() {
  const messageToSend = message.value.trim();
  if (!messageToSend || submitting.value) return;
  submitting.value = true;
  error.value = "";
  try {
    await request("/api/guestbook", {
      method: "POST",
      body: { message: messageToSend },
    });
    if (message.value.trim() === messageToSend) {
      message.value = "";
    }
    await loadGuestbook();
  } catch (submitError: unknown) {
    error.value =
      submitError instanceof Error ? submitError.message : "Unable to save your message.";
  } finally {
    submitting.value = false;
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(`${value.replace(" ", "T")}Z`)
  );
}

onMounted(loadGuestbook);
</script>

<template>
  <section class="guestbook-section">
    <div class="section-heading guestbook-heading">
      <p class="eyebrow">A note from the internet</p>
      <h1>Guestbook</h1>
      <p class="section-copy">Leave a kind word, share what you’re building, or just say hello.</p>
    </div>

    <div v-if="!loading && user" class="guestbook-composer guestbook-card">
      <div class="guestbook-user-row">
        <img
          v-if="user.avatarUrl"
          :src="user.avatarUrl"
          :alt="user.username"
          class="guestbook-avatar"
        />
        <div>
          <strong>{{ user.username }}</strong>
          <button type="button" class="guestbook-text-button" @click="signOut">
            <LogOutIcon />
            Sign out
          </button>
        </div>
      </div>
      <form class="guestbook-form" @submit.prevent="submitMessage">
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
        <UButton type="submit" :loading="submitting" :disabled="!message.trim()">
          Sign guestbook
        </UButton>
      </form>
    </div>

    <div v-else-if="!loading" class="guestbook-login guestbook-card">
      <p>Want to leave a message?</p>
      <a href="/api/auth/github" class="guestbook-button" rel="external">
        <GitHubIcon />
        Sign in with GitHub
      </a>
    </div>

    <p v-if="error" class="guestbook-error" role="alert">{{ error }}</p>
    <p v-if="loading" class="guestbook-empty">Loading messages...</p>
    <p v-else-if="!entries.length" class="guestbook-empty">
      No messages yet. Be the first to sign!
    </p>

    <div v-else class="guestbook-entries">
      <article v-for="entry in entries" :key="entry.id" class="guestbook-entry">
        <img
          v-if="entry.avatarUrl"
          :src="entry.avatarUrl"
          :alt="entry.username"
          class="guestbook-avatar"
          loading="lazy"
        />
        <div class="guestbook-entry-body">
          <div class="guestbook-entry-meta">
            <a :href="entry.profileUrl" target="_blank" rel="noreferrer">{{ entry.username }}</a>
            <time>{{ formatDate(entry.createdAt) }}</time>
          </div>
          <p>{{ entry.message }}</p>
        </div>
      </article>
    </div>
  </section>
</template>
