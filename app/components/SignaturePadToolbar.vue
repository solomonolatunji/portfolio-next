<script setup lang="ts">
defineProps<{
  colors: { label: string; value: string }[];
  hasDrawn: boolean;
  disabled?: boolean;
}>();

const selectedColor = defineModel<string>("selectedColor", { required: true });

defineEmits<{
  (e: "upload"): void;
  (e: "clear"): void;
}>();
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-2">
    <div class="flex items-baseline gap-[0.45rem]">
      <span class="text-[0.8rem] font-semibold text-ink">Signature</span>
      <span class="text-[0.7rem] text-soft">(Optional — sign or doodle below)</span>
    </div>
    <div class="flex items-center gap-[0.4rem]">
      <div class="mr-[0.2rem] flex items-center gap-[0.35rem]" role="radiogroup" aria-label="Signature ink color">
        <button v-for="color in colors" :key="color.value" type="button"
          class="size-3.5 cursor-pointer rounded-full border-[1.5px] p-0 transition duration-150 enabled:hover:scale-[1.18]"
          :class="selectedColor === color.value
              ? 'scale-[1.28] border-white shadow-[0_0_0_1px_rgba(0,0,0,0.4)]'
              : 'border-transparent'
            " :style="{ backgroundColor: color.value }" :title="color.label" :disabled="disabled"
          @click="selectedColor = color.value" />
      </div>
      <UButton type="button" size="xs" color="neutral" variant="outline" title="Upload signature image"
        :disabled="disabled" @click="$emit('upload')">
        Upload
      </UButton>
      <UButton v-if="hasDrawn" type="button" size="xs" color="error" variant="outline" :disabled="disabled"
        @click="$emit('clear')">
        Clear
      </UButton>
    </div>
  </div>
</template>
