<script setup lang="ts">
import { siApplemusic, siSpotify, siYoutubemusic } from "simple-icons";
import { aboutData, activeProducts, profileLinks } from "@/constants/about";
import EmailIcon from "@/components/icons/EmailIcon.vue";
import GitHubIcon from "@/components/icons/GitHubIcon.vue";
import LinkedInIcon from "@/components/icons/LinkedInIcon.vue";
import ListeningModal from "@/components/ListeningModal.vue";
import ListeningBarsIcon from "@/components/icons/ListeningBarsIcon.vue";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon.vue";
import XIcon from "@/components/icons/XIcon.vue";
import { useNowPlaying } from "@/composables/useNowPlaying";

const profileIcons = {
  github: GitHubIcon,
  email: EmailIcon,
  x: XIcon,
  linkedin: LinkedInIcon,
  whatsapp: WhatsAppIcon,
} as const;

const {
  nowPlaying,
  nowPlayingLoaded,
  isListeningModalOpen,
  listeningStateLabel,
  listeningDeviceLabel,
  openListeningModal,
  closeListeningModal,
} = useNowPlaying();
</script>

<template>
  <section class="hero">
    <div class="hero-copy">
      <p class="eyebrow">Software Engineer</p>
      <h1>{{ aboutData.name }}</h1>

      <div class="hero-building-row" aria-label="Products currently building">
        <span class="hero-building-label">Building</span>
        <template v-for="(product, index) in activeProducts" :key="product.label">
          <div class="hero-building-item">
            <img
              :src="product.logo"
              :alt="`${product.label} logo`"
              class="hero-building-logo"
              loading="lazy"
            />
            <span>{{ product.label }}</span>
          </div>
          <span v-if="index < activeProducts.length - 1" class="hero-building-separator">and</span>
        </template>
      </div>

      <button
        v-if="nowPlaying"
        type="button"
        class="listening-card"
        aria-label="Open listening details"
        @click="openListeningModal"
      >
        <img
          v-if="nowPlaying.artworkUrl"
          :src="nowPlaying.artworkUrl"
          :alt="`${nowPlaying.title} cover art`"
          class="listening-artwork"
          loading="lazy"
        />

        <div class="listening-copy">
          <span class="listening-label">{{ listeningStateLabel }}</span>
          <div class="listening-text">
            <p class="listening-track">{{ nowPlaying.title }}</p>
            <p class="listening-artist">{{ nowPlaying.artist }}</p>
          </div>
          <div class="listening-side">
            <span v-if="listeningDeviceLabel" class="listening-device">
              {{ listeningDeviceLabel }}
            </span>
            <div class="listening-controls-row">
              <div
                class="listening-beam"
                :class="{ paused: !nowPlaying.isPlaying }"
                aria-hidden="true"
              >
                <ListeningBarsIcon />
              </div>
              <div class="listening-links" aria-label="Listening links" @click.stop>
                <a
                  :href="nowPlaying.spotifyUrl"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open on Spotify"
                  @click.stop
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path :fill="`#${siSpotify.hex}`" :d="siSpotify.path" />
                  </svg>
                </a>
                <a
                  v-if="nowPlaying.appleMusicUrl"
                  :href="nowPlaying.appleMusicUrl"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open on Apple Music"
                  @click.stop
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path :fill="`#${siApplemusic.hex}`" :d="siApplemusic.path" />
                  </svg>
                </a>
                <a
                  v-if="nowPlaying.youtubeUrl"
                  :href="nowPlaying.youtubeUrl"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open on YouTube Music"
                  @click.stop
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path :fill="`#${siYoutubemusic.hex}`" :d="siYoutubemusic.path" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </button>

      <div
        v-else-if="nowPlayingLoaded"
        class="listening-fallback"
        aria-label="Listening unavailable"
      >
        <span class="listening-label">Currently Listening</span>
        <p>No live track right now.</p>
      </div>

      <div class="contact-row" aria-label="Profile links">
        <a
          v-for="link in profileLinks"
          :key="link.label"
          class="contact-icon-button"
          :href="link.href"
          :aria-label="link.label"
          :target="link.label === 'Email' ? undefined : '_blank'"
          :rel="link.label === 'Email' ? undefined : 'noreferrer'"
        >
          <component :is="profileIcons[link.icon]" aria-hidden="true" />
        </a>
      </div>
    </div>
  </section>
  <ListeningModal
    v-if="nowPlaying && isListeningModalOpen"
    :now-playing="nowPlaying"
    :state-label="listeningStateLabel"
    @close="closeListeningModal"
  />
</template>
