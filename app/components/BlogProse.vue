<script setup lang="ts">
defineProps<{
  content: string;
}>();
</script>

<template>
  <div
    class="text-ink [&_h1]:text-ink [&_h2]:text-ink [&_h3]:text-ink [&_p]:text-muted [&_a]:text-ink [&_ul]:text-muted [&_ol]:text-muted [&_blockquote]:border-line-strong [&_blockquote]:text-soft [&_code]:bg-elevated [&_code]:border-line [&_pre]:bg-elevated [&_pre]:border-line [&_img]:border-line [&_hr]:border-line/60 my-8 space-y-4 text-sm leading-relaxed md:text-base [&_a]:underline [&_a]:hover:text-white [&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:rounded [&_code]:border [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:text-emerald-300 [&_h1]:mt-8 [&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mt-6 [&_h2]:mb-2.5 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_hr]:my-8 [&_img]:my-6 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl [&_img]:border [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5 [&_p]:mb-4 [&_p]:leading-relaxed [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:p-4 [&_pre_code]:border-none [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5"
    v-html="content"
  />
</template>
