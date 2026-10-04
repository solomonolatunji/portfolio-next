<script setup lang="ts">
defineProps<{
  prevPost: { title: string; slug: string } | null;
  nextPost: { title: string; slug: string } | null;
}>();
</script>

<template>
  <nav
    v-if="prevPost || nextPost"
    class="border-line/60 my-6 grid grid-cols-1 gap-4 border-t pt-6 sm:grid-cols-2"
    aria-label="Article navigation"
  >
    <div v-if="prevPost" class="flex flex-col">
      <span class="text-soft text-[0.7rem] font-bold tracking-[0.12em] uppercase">
        ← Previous Article
      </span>
      <NuxtLink
        :to="`/blog/${prevPost.slug}`"
        class="text-ink mt-1 text-sm font-semibold transition-colors hover:text-white hover:underline"
      >
        {{ prevPost.title }}
      </NuxtLink>
    </div>
    <div v-else />

    <div v-if="nextPost" class="flex flex-col sm:items-end sm:text-right">
      <span class="text-soft text-[0.7rem] font-bold tracking-[0.12em] uppercase">
        Next Article →
      </span>
      <NuxtLink
        :to="`/blog/${nextPost.slug}`"
        class="text-ink mt-1 text-sm font-semibold transition-colors hover:text-white hover:underline"
      >
        {{ nextPost.title }}
      </NuxtLink>
    </div>
  </nav>
</template>
