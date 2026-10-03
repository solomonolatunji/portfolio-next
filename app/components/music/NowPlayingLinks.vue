<script setup lang="ts">
import { siApplemusic, siSpotify, siYoutubemusic } from "simple-icons";
import type { NowPlaying } from "@/interfaces/now-playing";

defineProps<{
  nowPlaying: NowPlaying;
}>();
</script>

<template>
  <hr class="border-line/60 m-0 w-full border-t border-none" aria-hidden="true" />

  <div class="flex flex-col gap-2" aria-label="Listen on streaming services">
    <a
      :href="nowPlaying.spotifyUrl"
      target="_blank"
      rel="noreferrer"
      class="group border-line bg-elevated/60 hover:bg-card-hover hover:border-line-strong text-muted flex items-center gap-3 rounded-xl border p-3 text-sm font-medium transition-all hover:text-white"
    >
      <span class="flex size-5 shrink-0 items-center justify-center">
        <svg viewBox="0 0 24 24" class="size-4.5" aria-hidden="true">
          <path :fill="`#${siSpotify.hex}`" :d="siSpotify.path" />
        </svg>
      </span>
      <span class="flex-1">Spotify</span>
      <span
        class="text-soft group-hover:text-ink text-xs transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        aria-hidden="true"
        >↗</span
      >
    </a>

    <a
      v-if="nowPlaying.appleMusicUrl"
      :href="nowPlaying.appleMusicUrl"
      target="_blank"
      rel="noreferrer"
      class="group border-line bg-elevated/60 hover:bg-card-hover hover:border-line-strong text-muted flex items-center gap-3 rounded-xl border p-3 text-sm font-medium transition-all hover:text-white"
    >
      <span class="flex size-5 shrink-0 items-center justify-center">
        <svg viewBox="0 0 24 24" class="size-4.5" aria-hidden="true">
          <path :fill="`#${siApplemusic.hex}`" :d="siApplemusic.path" />
        </svg>
      </span>
      <span class="flex-1">Apple Music</span>
      <span
        class="text-soft group-hover:text-ink text-xs transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        aria-hidden="true"
        >↗</span
      >
    </a>

    <a
      v-if="nowPlaying.youtubeUrl"
      :href="nowPlaying.youtubeUrl"
      target="_blank"
      rel="noreferrer"
      class="group border-line bg-elevated/60 hover:bg-card-hover hover:border-line-strong text-muted flex items-center gap-3 rounded-xl border p-3 text-sm font-medium transition-all hover:text-white"
    >
      <span class="flex size-5 shrink-0 items-center justify-center">
        <svg viewBox="0 0 24 24" class="size-4.5" aria-hidden="true">
          <path :fill="`#${siYoutubemusic.hex}`" :d="siYoutubemusic.path" />
        </svg>
      </span>
      <span class="flex-1">YouTube Music</span>
      <span
        class="text-soft group-hover:text-ink text-xs transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        aria-hidden="true"
        >↗</span
      >
    </a>
  </div>
</template>
