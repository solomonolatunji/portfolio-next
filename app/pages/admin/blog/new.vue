<script setup lang="ts">
import BlogEditor from "@/components/BlogEditor.vue";
import { formatPageTitle } from "@/constants/site";

definePageMeta({
  middleware: "admin",
});

useHead({
  title: formatPageTitle("New Article | Admin Blog"),
});
</script>

<template>
  <div class="admin-editor-page">
    <BlogEditor :is-new="true" />
  </div>
</template>
