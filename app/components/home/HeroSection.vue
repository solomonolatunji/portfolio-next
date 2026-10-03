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
  <section
    class="mx-auto grid min-h-0 w-full max-w-[760px] content-center justify-items-center gap-4 pt-[0.9rem] pb-[0.4rem] sm:min-h-[34vh] sm:pt-[1.1rem]"
  >
    <div class="w-full">
      <p class="text-soft m-0 mb-[0.7rem] text-[0.72rem] font-bold tracking-[0.16em] uppercase">
        Software Engineer
      </p>
      <h1
        class="text-ink m-0 text-[clamp(1.7rem,10vw,2.25rem)] leading-none font-bold tracking-[-0.05em] whitespace-nowrap sm:text-[clamp(1.4rem,4vw,3.2rem)]"
      >
        {{ aboutData.name }}
      </h1>

      <div
        class="text-muted row-gap-2 sm:row-gap-[0.55rem] mt-4 flex flex-wrap items-center gap-[0.45rem] text-[0.84rem] sm:text-[0.9rem]"
        aria-label="Products currently building"
      >
        <span class="text-ink text-[0.68rem] font-bold tracking-[0.12em] uppercase">Building</span>
        <template v-for="(product, index) in activeProducts" :key="product.label">
          <div class="text-ink inline-flex items-center gap-[0.45rem] whitespace-nowrap">
            <img
              :src="product.logo"
              :alt="`${product.label} logo`"
              class="size-[1.25rem] shrink-0 rounded-[0.3rem] object-cover sm:size-[1.4rem]"
              loading="lazy"
            />
            <span>{{ product.label }}</span>
          </div>
          <span v-if="index < activeProducts.length - 1" class="text-muted">and</span>
        </template>
      </div>

      <div
        v-if="nowPlaying"
        role="button"
        tabindex="0"
        class="border-line hover:border-line-strong text-muted focus-visible:ring-line-strong mt-[0.9rem] grid w-full cursor-pointer grid-cols-[auto_1fr] items-start gap-[0.65rem] rounded-[0.85rem] border bg-[rgba(12,12,12,0.7)] p-[0.65rem] text-left transition-colors hover:bg-[rgba(15,15,15,0.8)] focus:outline-none focus-visible:ring-1 sm:mt-4 sm:gap-[0.8rem] sm:p-[0.7rem]"
        aria-label="Open listening details"
        @click="openListeningModal"
        @keydown.enter.self="openListeningModal"
        @keydown.space.self.prevent="openListeningModal"
      >
        <img
          v-if="nowPlaying.artworkUrl"
          :src="nowPlaying.artworkUrl"
          :alt="`${nowPlaying.title} cover art`"
          class="border-line mt-[0.05rem] size-[3.15rem] shrink-0 rounded-[0.65rem] border object-cover sm:size-[3.55rem]"
          loading="lazy"
        />

        <div
          class="grid w-full grid-cols-[minmax(0,1fr)_auto] grid-rows-[auto_auto] items-start gap-x-3 gap-y-[0.16rem] sm:gap-x-4"
        >
          <span
            class="text-ink col-start-1 row-start-1 text-[0.58rem] font-semibold tracking-[0.03em] whitespace-nowrap uppercase sm:text-[0.62rem] sm:tracking-[0.04em]"
          >
            {{ listeningStateLabel }}
          </span>
          <div class="col-start-1 row-start-2 grid min-w-0 content-center">
            <p class="text-ink m-0 truncate text-[0.9rem] leading-[1.35]">{{ nowPlaying.title }}</p>
            <p class="text-muted m-0 truncate text-[0.82rem] leading-[1.45]">
              {{ nowPlaying.artist }}
            </p>
          </div>
          <div
            class="col-start-2 row-span-2 row-start-1 ml-[0.15rem] grid min-w-0 shrink-0 content-start justify-items-end gap-y-1.5 self-start sm:ml-[0.2rem] sm:gap-y-[0.38rem]"
          >
            <span
              v-if="listeningDeviceLabel"
              class="text-muted m-0 justify-self-end text-right text-[0.58rem] leading-[1.35] font-bold tracking-[0.02em] whitespace-nowrap sm:text-[0.66rem]"
            >
              {{ listeningDeviceLabel }}
            </span>
            <div class="flex items-center justify-end gap-2 sm:gap-[0.65rem]">
              <div
                class="listening-beam h-[2rem] w-[2.7rem] sm:h-[2.5rem] sm:w-[3.6rem]"
                :class="{ paused: !nowPlaying.isPlaying }"
                aria-hidden="true"
              >
                <ListeningBarsIcon class="h-[1.4rem] w-[1.4rem] sm:h-8 sm:w-8" />
              </div>
              <div
                class="flex items-center justify-end gap-1.5 sm:gap-[0.55rem]"
                aria-label="Listening links"
                @click.stop
              >
                <a
                  :href="nowPlaying.spotifyUrl"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open on Spotify"
                  class="border-line text-ink hover:border-line-strong inline-flex size-[1.8rem] items-center justify-center rounded-full border bg-[linear-gradient(180deg,rgba(16,16,16,0.96),rgba(9,9,9,0.98))] transition-all hover:-translate-y-px sm:size-[2.3rem]"
                  @click.stop
                >
                  <svg viewBox="0 0 24 24" class="size-[0.9rem] sm:size-4" aria-hidden="true">
                    <path :fill="`#${siSpotify.hex}`" :d="siSpotify.path" />
                  </svg>
                </a>
                <a
                  v-if="nowPlaying.appleMusicUrl"
                  :href="nowPlaying.appleMusicUrl"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open on Apple Music"
                  class="border-line text-ink hover:border-line-strong inline-flex size-[1.8rem] items-center justify-center rounded-full border bg-[linear-gradient(180deg,rgba(16,16,16,0.96),rgba(9,9,9,0.98))] transition-all hover:-translate-y-px sm:size-[2.3rem]"
                  @click.stop
                >
                  <svg viewBox="0 0 24 24" class="size-[0.9rem] sm:size-4" aria-hidden="true">
                    <path :fill="`#${siApplemusic.hex}`" :d="siApplemusic.path" />
                  </svg>
                </a>
                <a
                  v-if="nowPlaying.youtubeUrl"
                  :href="nowPlaying.youtubeUrl"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open on YouTube Music"
                  class="border-line text-ink hover:border-line-strong inline-flex size-[1.8rem] items-center justify-center rounded-full border bg-[linear-gradient(180deg,rgba(16,16,16,0.96),rgba(9,9,9,0.98))] transition-all hover:-translate-y-px sm:size-[2.3rem]"
                  @click.stop
                >
                  <svg viewBox="0 0 24 24" class="size-[0.9rem] sm:size-4" aria-hidden="true">
                    <path :fill="`#${siYoutubemusic.hex}`" :d="siYoutubemusic.path" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else-if="nowPlayingLoaded"
        class="border-line text-muted mt-[0.9rem] flex w-full items-center justify-between rounded-[0.85rem] border bg-[rgba(12,12,12,0.7)] p-[0.65rem] text-xs sm:mt-4 sm:p-[0.7rem]"
        aria-label="Listening unavailable"
      >
        <span
          class="text-ink text-[0.58rem] font-semibold tracking-[0.03em] uppercase sm:text-[0.62rem] sm:tracking-[0.04em]"
          >Currently Listening</span
        >
        <p class="m-0 text-[0.82rem]">No live track right now.</p>
      </div>

      <div
        class="mt-5 flex items-center gap-2 sm:mt-[1.35rem] sm:gap-[0.65rem]"
        aria-label="Profile links"
      >
        <a
          v-for="link in profileLinks"
          :key="link.label"
          class="border-line text-ink hover:border-line-strong inline-flex size-10 items-center justify-center rounded-full border bg-[linear-gradient(180deg,rgba(16,16,16,0.96),rgba(9,9,9,0.98))] transition-all hover:-translate-y-0.5 [&_svg]:size-[0.95rem] [&_svg]:fill-current"
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
