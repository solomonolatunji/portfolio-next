<script setup lang="ts">
import NowPlayingLinks from "./NowPlayingLinks.vue";
import NowPlayingWaveform from "./NowPlayingWaveform.vue";
import type { NowPlaying } from "@/interfaces/now-playing";

defineProps<{
  nowPlaying: NowPlaying;
  stateLabel: string;
}>();

const emit = defineEmits<{
  close: [];
}>();
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      role="presentation"
      @click="emit('close')"
    >
      <div
        class="bg-card border-line shadow-card text-ink relative w-full max-w-sm overflow-hidden rounded-2xl border"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lm-title"
        @click.stop
      >
        <div
          class="pointer-events-none absolute inset-0 overflow-hidden opacity-25"
          aria-hidden="true"
        >
          <img
            v-if="nowPlaying.artworkUrl"
            :src="nowPlaying.artworkUrl"
            alt=""
            class="size-full scale-125 object-cover blur-2xl"
          />
          <div class="via-card/70 to-card absolute inset-0 bg-gradient-to-b from-transparent" />
        </div>

        <button
          type="button"
          class="border-line/80 text-muted hover:text-ink hover:border-line-strong hover:bg-card-hover absolute top-3.5 right-3.5 z-20 flex size-7 cursor-pointer items-center justify-center rounded-full border transition-all"
          aria-label="Close listening details"
          @click="emit('close')"
        >
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path
              d="M1 1L13 13M13 1L1 13"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
            />
          </svg>
        </button>

        <div class="relative z-10 flex justify-center px-7 pt-7">
          <img
            v-if="nowPlaying.artworkUrl"
            :src="nowPlaying.artworkUrl"
            :alt="`${nowPlaying.title} cover art`"
            class="size-52 rounded-xl border border-white/10 object-cover shadow-2xl"
            loading="lazy"
          />
          <div
            v-else
            class="bg-elevated border-line flex size-52 items-center justify-center rounded-xl border"
          >
            <span class="text-soft text-xs">No artwork</span>
          </div>
        </div>

        <div
          v-if="nowPlaying.isPlaying"
          class="relative z-10 -mt-4 flex justify-center"
          aria-hidden="true"
        >
          <NowPlayingWaveform />
        </div>

        <div class="relative z-10 flex flex-col gap-3 p-6">
          <div class="flex items-center gap-2">
            <span class="relative flex size-2">
              <span
                class="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75"
              />
              <span class="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span class="text-soft text-[0.68rem] font-bold tracking-[0.14em] uppercase">{{
              stateLabel
            }}</span>
          </div>

          <div class="space-y-0.5">
            <h3 id="lm-title" class="text-ink m-0 truncate text-base font-bold">
              {{ nowPlaying.title }}
            </h3>
            <p class="text-muted m-0 truncate text-sm">{{ nowPlaying.artist }}</p>
            <p v-if="nowPlaying.album" class="text-soft m-0 truncate text-xs">
              {{ nowPlaying.album }}
            </p>
          </div>

          <div
            v-if="nowPlaying.deviceName || nowPlaying.deviceType"
            class="text-soft bg-chip border-chip-line inline-flex items-center gap-1.5 self-start rounded-full border px-2.5 py-0.5 text-[0.68rem]"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect
                x="2"
                y="3"
                width="20"
                height="14"
                rx="2"
                stroke="currentColor"
                stroke-width="1.8"
              />
              <path
                d="M8 21H16M12 17V21"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
            {{ nowPlaying.deviceName ?? nowPlaying.deviceType }}
          </div>

          <NowPlayingLinks :now-playing="nowPlaying" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
