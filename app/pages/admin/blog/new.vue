<script setup lang="ts">
import BlogEditor from "@/components/BlogEditor.vue";

const siteConfig = useSiteConfig();

definePageMeta({
  middleware: "admin",
});

useHead({
  title: siteConfig.pageTitle("New Article | Admin Blog"),
});
</script>

<template>
  <div class="py-2">
    <BlogEditor :is-new="true" />
  </div>
</template>
