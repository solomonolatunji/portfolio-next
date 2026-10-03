<script setup lang="ts">
import type { GuestbookEntry } from "@/interfaces/guestbook";
import { formatDate } from "@/utils/date";

defineProps<{ entry: GuestbookEntry }>();
</script>

<template>
  <article class="flex min-w-0 flex-col rounded-xl border border-line px-[1.2rem] py-[1.1rem]">
    <p class="m-0 text-[0.95rem] leading-[1.55] wrap-break-word whitespace-pre-wrap text-ink">
      {{ entry.message }}
    </p>
    <div v-if="entry.signatureUrl" class="flex justify-center py-[0.6rem]">
      <img :src="entry.signatureUrl" :alt="`${entry.username}'s signature`"
        class="block max-h-14 max-w-full object-contain" loading="lazy" />
    </div>
    <footer class="mt-auto flex items-center gap-[0.6rem] border-t border-line pt-[0.9rem]">
      <UAvatar v-if="entry.avatarUrl" :src="entry.avatarUrl" :alt="entry.username" size="sm" />
      <div>
        <a :href="entry.profileUrl" target="_blank" rel="noreferrer"
          class="block text-[0.86rem] font-bold text-ink hover:underline">{{ entry.username }}</a>
        <time class="mt-[0.15rem] block text-[0.68rem] tracking-[0.06em] text-soft uppercase">{{
          formatDate(entry.createdAt)
          }}</time>
      </div>
    </footer>
  </article>
</template>
