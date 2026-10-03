<script setup lang="ts">
import { siApplemusic, siSpotify, siYoutubemusic } from "simple-icons";
import { aboutData, activeProducts, profileLinks } from "@/constants/about";
import EmailIcon from "@/components/icons/EmailIcon.vue";
import GitHubIcon from "@/components/icons/GitHubIcon.vue";
import LinkedInIcon from "@/components/icons/LinkedInIcon.vue";
import ListeningModal from "@/components/music/ListeningModal.vue";
import ListeningBarsIcon from "@/components/icons/ListeningBarsIcon.vue";
import TikTokIcon from "@/components/icons/TikTokIcon.vue";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon.vue";
import XIcon from "@/components/icons/XIcon.vue";
import { useNowPlaying } from "@/composables/useNowPlaying";

const profileIcons = {
  github: GitHubIcon,
  email: EmailIcon,
  x: XIcon,
  tiktok: TikTokIcon,
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
  <section class="grid min-h-[34vh] w-full content-center justify-items-center gap-4 py-4">
    <div class="mx-auto w-full max-w-190">
      <p class="text-soft mb-2 text-[0.72rem] font-bold tracking-[0.16em] uppercase">
        Software Engineer
      </p>
      <h1
        class="text-ink m-0 text-[clamp(1.8rem,4vw,3.2rem)] leading-tight font-bold tracking-[-0.05em] whitespace-nowrap"
      >
        {{ aboutData.name }}
      </h1>

      <div
        class="text-muted mt-4 flex flex-wrap items-center gap-2 text-sm"
        aria-label="Products currently building"
      >
        <span class="text-ink text-[0.68rem] font-bold tracking-[0.12em] uppercase">Building</span>
        <template v-for="(product, index) in activeProducts" :key="product.label">
          <div class="text-ink inline-flex items-center gap-1.5 whitespace-nowrap">
            <img
              :src="product.logo"
              :alt="`${product.label} logo`"
              class="size-5.5 shrink-0 rounded object-cover"
              loading="lazy"
            />
            <span>{{ product.label }}</span>
          </div>
          <span v-if="index < activeProducts.length - 1" class="text-muted">and</span>
        </template>
      </div>

      <button
        v-if="nowPlaying"
        type="button"
        class="bg-card border-line hover:border-line-strong hover:bg-card-hover shadow-card group mt-4 flex w-full cursor-pointer items-center gap-3.5 rounded-xl border p-3 text-left transition-all"
        aria-label="Open listening details"
        @click="openListeningModal"
      >
        <img
          v-if="nowPlaying.artworkUrl"
          :src="nowPlaying.artworkUrl"
          :alt="`${nowPlaying.title} cover art`"
          class="border-line/60 size-14 shrink-0 rounded-lg border object-cover"
          loading="lazy"
        />

        <div class="flex min-w-0 flex-1 flex-col gap-0.5">
          <span class="text-soft text-[0.68rem] font-bold tracking-[0.12em] uppercase">{{
            listeningStateLabel
          }}</span>
          <div class="truncate">
            <p class="text-ink m-0 truncate text-sm font-semibold">{{ nowPlaying.title }}</p>
            <p class="text-muted m-0 truncate text-xs">{{ nowPlaying.artist }}</p>
          </div>
        </div>

        <div class="ml-auto flex shrink-0 items-center gap-3">
          <span
            v-if="listeningDeviceLabel"
            class="text-soft bg-chip border-chip-line hidden rounded-full border px-2 py-0.5 text-[0.68rem] sm:inline-block"
          >
            {{ listeningDeviceLabel }}
          </span>
          <div class="flex items-center gap-2.5">
            <div
              class="text-muted flex items-center"
              :class="{ 'opacity-50': !nowPlaying.isPlaying }"
              aria-hidden="true"
            >
              <ListeningBarsIcon />
            </div>
            <div class="flex items-center gap-2" aria-label="Listening links" @click.stop>
              <a
                :href="nowPlaying.spotifyUrl"
                target="_blank"
                rel="noreferrer"
                aria-label="Open on Spotify"
                class="text-muted hover:text-ink p-1 transition-colors"
                @click.stop
              >
                <svg viewBox="0 0 24 24" class="size-4.5" aria-hidden="true">
                  <path :fill="`#${siSpotify.hex}`" :d="siSpotify.path" />
                </svg>
              </a>
              <a
                v-if="nowPlaying.appleMusicUrl"
                :href="nowPlaying.appleMusicUrl"
                target="_blank"
                rel="noreferrer"
                aria-label="Open on Apple Music"
                class="text-muted hover:text-ink p-1 transition-colors"
                @click.stop
              >
                <svg viewBox="0 0 24 24" class="size-4.5" aria-hidden="true">
                  <path :fill="`#${siApplemusic.hex}`" :d="siApplemusic.path" />
                </svg>
              </a>
              <a
                v-if="nowPlaying.youtubeUrl"
                :href="nowPlaying.youtubeUrl"
                target="_blank"
                rel="noreferrer"
                aria-label="Open on YouTube Music"
                class="text-muted hover:text-ink p-1 transition-colors"
                @click.stop
              >
                <svg viewBox="0 0 24 24" class="size-4.5" aria-hidden="true">
                  <path :fill="`#${siYoutubemusic.hex}`" :d="siYoutubemusic.path" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </button>

      <div
        v-else-if="nowPlayingLoaded"
        class="bg-card/50 border-line text-muted mt-4 flex w-full items-center justify-between rounded-xl border p-3 text-xs"
        aria-label="Listening unavailable"
      >
        <span class="text-soft text-[0.68rem] font-bold tracking-[0.12em] uppercase"
          >Currently Listening</span
        >
        <p class="m-0">No live track right now.</p>
      </div>

      <div class="mt-6 flex items-center gap-2" aria-label="Profile links">
        <a
          v-for="link in profileLinks"
          :key="link.label"
          class="border-line text-muted hover:border-line-strong hover:text-ink hover:bg-card inline-flex size-9 items-center justify-center rounded-full border transition-all [&_svg]:size-4.5 [&_svg]:fill-current"
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
