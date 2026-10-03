<script setup lang="ts">
import NowPlayingArtwork from "./NowPlayingArtwork.vue";
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
    <div class="lm-backdrop" role="presentation" @click="emit('close')">
      <div class="lm-shell" role="dialog" aria-modal="true" aria-labelledby="lm-title" @click.stop>
        <div class="lm-bg-layer" aria-hidden="true">
          <img v-if="nowPlaying.artworkUrl" :src="nowPlaying.artworkUrl" alt="" class="lm-bg-img" />
          <div class="lm-bg-overlay" />
          <div class="lm-bg-eclipse" />
          <div class="lm-bg-noise" />
        </div>

        <button
          type="button"
          class="lm-close"
          aria-label="Close listening details"
          @click="emit('close')"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M1 1L13 13M13 1L1 13"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
            />
          </svg>
        </button>

        <NowPlayingArtwork :artwork-url="nowPlaying.artworkUrl" :title="nowPlaying.title" />

        <div v-if="nowPlaying.isPlaying" class="lm-wave-slot" aria-hidden="true">
          <NowPlayingWaveform />
        </div>

        <div class="lm-body">
          <div class="lm-label-row">
            <span class="lm-pulse" aria-hidden="true">
              <span class="lm-pulse-dot" />
            </span>
            <span class="lm-label">{{ stateLabel }}</span>
          </div>

          <div class="lm-meta">
            <h3 id="lm-title" class="lm-title">{{ nowPlaying.title }}</h3>
            <p class="lm-artist">{{ nowPlaying.artist }}</p>
            <p v-if="nowPlaying.album" class="lm-album">{{ nowPlaying.album }}</p>
          </div>

          <div v-if="nowPlaying.deviceName || nowPlaying.deviceType" class="lm-device">
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

<style scoped src="@/assets/css/listening-modal.css"></style>
<style scoped src="@/assets/css/listening-modal-media.css"></style>
