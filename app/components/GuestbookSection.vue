<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import GitHubIcon from "@/components/icons/GitHubIcon.vue";
import LogOutIcon from "@/components/icons/LogOutIcon.vue";
import SignaturePad from "@/components/SignaturePad.vue";
import type { GuestbookEntry, GuestbookUser } from "@/interfaces/guestbook";
import { formatDate } from "@/utils/date";

const user = ref<GuestbookUser | null>(null);
const entries = ref<GuestbookEntry[]>([]);
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
        <SignaturePad
          ref="signaturePadRef"
          v-model="signature"
          :disabled="submitting"
        />
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

    <div v-else class="guestbook-notes">
      <article v-for="entry in entries" :key="entry.id" class="guestbook-note">
        <p class="guestbook-note-message">{{ entry.message }}</p>
        <div v-if="entry.signatureUrl" class="guestbook-note-signature">
          <img
            :src="entry.signatureUrl"
            :alt="`${entry.username}'s signature`"
            loading="lazy"
          />
        </div>
        <footer class="guestbook-note-footer">
          <img
            v-if="entry.avatarUrl"
            :src="entry.avatarUrl"
            :alt="entry.username"
            class="guestbook-note-avatar"
            loading="lazy"
          />
          <div>
            <a :href="entry.profileUrl" target="_blank" rel="noreferrer">{{ entry.username }}</a>
            <time>{{ formatDate(entry.createdAt) }}</time>
          </div>
        </footer>
      </article>
    </div>
  </section>
</template>
