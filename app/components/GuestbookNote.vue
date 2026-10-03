<script setup lang="ts">
import type { GuestbookEntry } from "@/interfaces/guestbook";
import { formatDate } from "@/utils/date";

defineProps<{ entry: GuestbookEntry }>();
</script>

<template>
  <article class="border-line flex min-w-0 flex-col rounded-xl border px-[1.2rem] py-[1.1rem]">
    <p class="text-ink m-0 text-[0.95rem] leading-[1.55] wrap-break-word whitespace-pre-wrap">
      {{ entry.message }}
    </p>
    <div v-if="entry.signatureUrl" class="flex justify-center py-[0.6rem]">
      <img
        :src="entry.signatureUrl"
        :alt="`${entry.username}'s signature`"
        class="block max-h-14 max-w-full object-contain"
        loading="lazy"
      />
    </div>
    <footer class="border-line mt-auto flex items-center gap-[0.6rem] border-t pt-[0.9rem]">
      <UAvatar v-if="entry.avatarUrl" :src="entry.avatarUrl" :alt="entry.username" size="sm" />
      <div>
        <a
          :href="entry.profileUrl"
          target="_blank"
          rel="noreferrer"
          class="text-ink block text-[0.86rem] font-bold hover:underline"
          >{{ entry.username }}</a
        >
        <time class="text-soft mt-[0.15rem] block text-[0.68rem] tracking-[0.06em] uppercase">{{
          formatDate(entry.createdAt)
        }}</time>
      </div>
    </footer>
  </article>
</template>
