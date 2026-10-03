<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  currentPage: number;
  totalPages: number;
}>();

const emit = defineEmits<{
  (e: "update:page", page: number): void;
}>();

function goToPage(page: number) {
  if (page < 1 || page > props.totalPages || page === props.currentPage) return;
  emit("update:page", page);
}

const pageNumbers = computed(() => {
  const total = props.totalPages;
  const current = props.currentPage;
  const pages: (number | string)[] = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push("...");

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 2) pages.push("...");
    pages.push(total);
  }

  return pages;
});
</script>

<template>
  <nav v-if="totalPages > 1" class="blog-pagination" aria-label="Blog pages pagination">
    <button
      type="button"
      class="pagination-btn pagination-nav"
      :disabled="currentPage <= 1"
      aria-label="Go to previous page"
      @click="goToPage(currentPage - 1)"
    >
      ← Prev
    </button>

    <div class="pagination-numbers">
      <template v-for="(p, idx) in pageNumbers" :key="idx">
        <span v-if="p === '...'" class="pagination-ellipsis">…</span>
        <button
          v-else
          type="button"
          class="pagination-btn pagination-number"
          :class="{ active: p === currentPage }"
          :aria-current="p === currentPage ? 'page' : undefined"
          @click="goToPage(Number(p))"
        >
          {{ p }}
        </button>
      </template>
    </div>

    <button
      type="button"
      class="pagination-btn pagination-nav"
      :disabled="currentPage >= totalPages"
      aria-label="Go to next page"
      @click="goToPage(currentPage + 1)"
    >
      Next →
    </button>
  </nav>
</template>
