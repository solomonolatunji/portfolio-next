<script setup lang="ts">
import ListeningBarsIcon from "@/components/icons/ListeningBarsIcon.vue";
</script>

<template>
  <div
    class="bg-elevated/90 inline-flex size-8 items-center justify-center rounded-full border border-white/10 text-emerald-400 shadow-lg backdrop-blur-md [&_svg]:size-4 [&_svg]:fill-current"
    aria-label="Playing"
    aria-hidden="true"
  >
    <ListeningBarsIcon />
  </div>
</template>
