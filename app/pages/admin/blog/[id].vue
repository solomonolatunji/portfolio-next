<script setup lang="ts">
import { computed } from "vue";
import BlogEditor from "@/components/BlogEditor.vue";
import type { BlogPost } from "@/interfaces/blog";
const siteConfig = useSiteConfig();

definePageMeta({
  middleware: "admin",
});

const route = useRoute();
const id = computed(() => Number(route.params.id));

const { data, status, error } = await useAsyncData(
  `admin-post-${id.value}`,
  async () => {
    return await $fetch<{ post: BlogPost }>(`/api/admin/posts/${id.value}` as string);
  }
);

const post = computed(() => data.value?.post || null);

useHead(() => ({
  title: post.value
    ? siteConfig.pageTitle(`Edit "${post.value.title}"`)
    : siteConfig.pageTitle("Edit Article | Admin Blog"),
}));
</script>

<template>
  <div class="admin-editor-page">
    <div v-if="status === 'pending'" class="guestbook-empty">
      Loading article...
    </div>

    <div v-else-if="error || !post" class="guestbook-empty">
      <p>Article not found or failed to load.</p>
      <NuxtLink to="/admin/blog" class="guestbook-button mt-4 inline-flex">
        Back to Blog Management
      </NuxtLink>
    </div>

    <BlogEditor v-else :post="post" :is-new="false" />
  </div>
</template>
