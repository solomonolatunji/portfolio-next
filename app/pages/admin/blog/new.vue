<script setup lang="ts">
import BlogEditor from "@/components/BlogEditor.vue";

definePageMeta({
  middleware: "admin",
});

useHead({
  title: "New Article | Admin Blog",
});
</script>

<template>
  <div class="admin-editor-page">
    <BlogEditor :is-new="true" />
  </div>
</template>
