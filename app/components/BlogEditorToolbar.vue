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
  <div class="markdown-toolbar">
    <button type="button" class="toolbar-btn" title="Bold" @click="emit('wrap', '**', '**', 'bold text')">
      <strong>B</strong>
    </button>
    <button type="button" class="toolbar-btn" title="Italic" @click="emit('wrap', '*', '*', 'italic text')">
      <em>I</em>
    </button>
    <button type="button" class="toolbar-btn" title="Heading 2" @click="emit('insert-prefix', '## ')">
      H2
    </button>
    <button type="button" class="toolbar-btn" title="Heading 3" @click="emit('insert-prefix', '### ')">
      H3
    </button>
    <button type="button" class="toolbar-btn" title="Quote" @click="emit('insert-prefix', '> ')">
      ❝
    </button>
    <button type="button" class="toolbar-btn" title="Code Block"
      @click="emit('wrap', '```ts\n', '\n```', '// code here')">
      &lt;/&gt;
    </button>
    <button type="button" class="toolbar-btn" title="Bullet List" @click="emit('insert-prefix', '- ')">
      • List
    </button>
    <button type="button" class="toolbar-btn" title="Link" @click="emit('wrap', '[', '](https://)', 'link text')">
      🔗 Link
    </button>

    <span class="toolbar-sep"></span>

    <!-- Inline Image Upload -->
    <input ref="fileInputRef" type="file" accept="image/*" class="hidden-file-input" @change="onFileSelected" />
    <button type="button" class="toolbar-btn upload-toolbar-btn" :disabled="isUploadingInline"
      title="Upload image to Cloudinary & insert markdown" @click="fileInputRef?.click()">
      <span v-if="isUploadingInline">Uploading...</span>
      <span v-else>🖼️ Upload Image</span>
    </button>
  </div>
</template>
