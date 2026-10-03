<script setup lang="ts">
import { computed } from "vue";
import BlogEditor from "@/components/blog/BlogEditor.vue";
import type { BlogPost } from "@/interfaces/blog";

const siteConfig = usePortfolioConfig();

definePageMeta({
  middleware: "admin",
});

const route = useRoute();
const id = computed(() => Number(route.params.id));

const { data, status, error } = await useAsyncData(`admin-post-${id.value}`, async () => {
  return await $fetch<{ post: BlogPost }>(`/api/admin/posts/${id.value}` as string);
});

const post = computed(() => data.value?.post || null);

useHead(() => ({
  title: post.value
    ? siteConfig.pageTitle(`Edit "${post.value.title}"`)
    : siteConfig.pageTitle("Edit Article | Admin Blog"),
}));
</script>

<template>
  <div class="py-2">
    <div
      v-if="status === 'pending'"
      class="border-line bg-card/40 text-soft flex items-center justify-center rounded-xl border p-12 text-sm"
    >
      Loading article...
    </div>

    <div
      v-else-if="error || !post"
      class="border-line flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center"
    >
      <p class="text-muted text-sm">Article not found or failed to load.</p>
      <UButton to="/admin/blog" color="neutral" class="mt-4"> Back to Blog Management </UButton>
    </div>

    <BlogEditor v-else :post="post" :is-new="false" />
  </div>
</template>
