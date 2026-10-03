<script setup lang="ts">
import { ref } from "vue";

defineProps<{
  isUploadingInline: boolean;
}>();

const emit = defineEmits<{
  (e: "wrap", prefix: string, suffix: string, defaultText: string): void;
  (e: "insert-prefix", prefix: string): void;
  (e: "upload-inline", file: File): void;
}>();

const fileInputRef = ref<HTMLInputElement | null>(null);

function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  emit("upload-inline", file);
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
}
</script>

<template>
  <div
    class="border-line bg-card flex flex-wrap items-center gap-1 rounded-t-lg border p-1.5 text-xs"
  >
    <button
      type="button"
      class="text-muted hover:bg-chip hover:text-ink inline-flex h-7 cursor-pointer items-center justify-center rounded px-2 font-bold transition-colors"
      title="Bold"
      @click="emit('wrap', '**', '**', 'bold text')"
    >
      <strong>B</strong>
    </button>
    <button
      type="button"
      class="text-muted hover:bg-chip hover:text-ink inline-flex h-7 cursor-pointer items-center justify-center rounded px-2 italic transition-colors"
      title="Italic"
      @click="emit('wrap', '*', '*', 'italic text')"
    >
      <em>I</em>
    </button>
    <button
      type="button"
      class="text-muted hover:bg-chip hover:text-ink inline-flex h-7 cursor-pointer items-center justify-center rounded px-2 font-medium transition-colors"
      title="Heading 2"
      @click="emit('insert-prefix', '## ')"
    >
      H2
    </button>
    <button
      type="button"
      class="text-muted hover:bg-chip hover:text-ink inline-flex h-7 cursor-pointer items-center justify-center rounded px-2 font-medium transition-colors"
      title="Heading 3"
      @click="emit('insert-prefix', '### ')"
    >
      H3
    </button>
    <button
      type="button"
      class="text-muted hover:bg-chip hover:text-ink inline-flex h-7 cursor-pointer items-center justify-center rounded px-2 transition-colors"
      title="Quote"
      @click="emit('insert-prefix', '> ')"
    >
      ❝
    </button>
    <button
      type="button"
      class="text-muted hover:bg-chip hover:text-ink inline-flex h-7 cursor-pointer items-center justify-center rounded px-2 font-mono transition-colors"
      title="Code Block"
      @click="emit('wrap', '```ts\n', '\n```', '// code here')"
    >
      &lt;/&gt;
    </button>
    <button
      type="button"
      class="text-muted hover:bg-chip hover:text-ink inline-flex h-7 cursor-pointer items-center justify-center rounded px-2 transition-colors"
      title="Bullet List"
      @click="emit('insert-prefix', '- ')"
    >
      • List
    </button>
    <button
      type="button"
      class="text-muted hover:bg-chip hover:text-ink inline-flex h-7 cursor-pointer items-center justify-center rounded px-2 transition-colors"
      title="Link"
      @click="emit('wrap', '[', '](https://)', 'link text')"
    >
      🔗 Link
    </button>

    <span class="bg-line mx-1 h-4 w-px"></span>

    <!-- Inline Image Upload -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="onFileSelected"
    />
    <button
      type="button"
      class="text-muted hover:bg-chip hover:text-ink inline-flex h-7 cursor-pointer items-center gap-1.5 rounded px-2 text-xs font-medium transition-colors disabled:pointer-events-none disabled:opacity-50"
      :disabled="isUploadingInline"
      title="Upload image to Cloudinary & insert markdown"
      @click="fileInputRef?.click()"
    >
      <span
        v-if="isUploadingInline"
        class="inline-block size-3 animate-spin rounded-full border border-current border-t-transparent"
      />
      <span v-if="isUploadingInline">Uploading...</span>
      <span v-else>🖼️ Upload Image</span>
    </button>
  </div>
</template>
