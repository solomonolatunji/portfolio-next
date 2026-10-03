<script setup lang="ts">
definePageMeta({
  middleware: [
    () => {
      return navigateTo("/admin/blog");
    },
  ],
});
</script>

<template>
  <div></div>
</template>
