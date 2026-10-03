<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    disabled?: boolean;
  }>(),
  {
    modelValue: "",
    disabled: false,
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const isDrawing = ref(false);
const hasDrawn = ref(false);

const colors = [
  { label: "White", value: "#F4F4F5" },
  { label: "Gold", value: "#FBBF24" },
  { label: "Emerald", value: "#34D399" },
  { label: "Sky", value: "#38BDF8" },
  { label: "Violet", value: "#C084FC" },
];
const selectedColor = ref(colors[0]?.value ?? "#F4F4F5");
const lineWidth = 2.5;

let points: { x: number; y: number }[] = [];
let resizeObserver: ResizeObserver | null = null;

function getCoordinates(event: MouseEvent | Touch): { x: number; y: number } | null {
  const canvas = canvasRef.value;
  if (!canvas) return null;
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function renderStroke() {
  const canvas = canvasRef.value;
  const ctx = canvas?.getContext("2d");
  if (!ctx || points.length < 2) return;

  const len = points.length;
  if (len >= 3) {
    const p0 = points[len - 3];
    const p1 = points[len - 2];
    const p2 = points[len - 1];
    if (!p0 || !p1 || !p2) return;
    const mid1 = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
    const mid2 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    ctx.beginPath();
    ctx.moveTo(mid1.x, mid1.y);
    ctx.quadraticCurveTo(p1.x, p1.y, mid2.x, mid2.y);
    ctx.strokeStyle = selectedColor.value;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  } else {
    const p0 = points[0];
    const p1 = points[1];
    if (!p0 || !p1) return;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.strokeStyle = selectedColor.value;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  }
}

function startDrawing(event: MouseEvent) {
  if (props.disabled) return;
  const coords = getCoordinates(event);
  if (!coords) return;
  isDrawing.value = true;
  hasDrawn.value = true;
  points = [coords];

  const canvas = canvasRef.value;
  const ctx = canvas?.getContext("2d");
  if (!ctx) return;
  ctx.beginPath();
  ctx.arc(coords.x, coords.y, lineWidth / 2, 0, Math.PI * 2);
  ctx.fillStyle = selectedColor.value;
  ctx.fill();
}

function draw(event: MouseEvent) {
  if (!isDrawing.value || props.disabled) return;
  const coords = getCoordinates(event);
  if (!coords) return;
  points.push(coords);
  renderStroke();
}

function stopDrawing() {
  if (!isDrawing.value) return;
  isDrawing.value = false;
  points = [];
  emitSignature();
}

function startTouchDrawing(event: TouchEvent) {
  if (props.disabled || event.touches.length === 0) return;
  const touch = event.touches[0];
  if (!touch) return;
  const coords = getCoordinates(touch);
  if (!coords) return;
  isDrawing.value = true;
  hasDrawn.value = true;
  points = [coords];

  const canvas = canvasRef.value;
  const ctx = canvas?.getContext("2d");
  if (!ctx) return;
  ctx.beginPath();
  ctx.arc(coords.x, coords.y, lineWidth / 2, 0, Math.PI * 2);
  ctx.fillStyle = selectedColor.value;
  ctx.fill();
}

function touchDraw(event: TouchEvent) {
  if (!isDrawing.value || props.disabled || event.touches.length === 0) return;
  const touch = event.touches[0];
  if (!touch) return;
  const coords = getCoordinates(touch);
  if (!coords) return;
  points.push(coords);
  renderStroke();
}

function emitSignature() {
  const canvas = canvasRef.value;
  if (!canvas || !hasDrawn.value) {
    emit("update:modelValue", "");
    return;
  }
  const dataUrl = canvas.toDataURL("image/png");
  emit("update:modelValue", dataUrl);
}

function clear() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
  hasDrawn.value = false;
  points = [];
  emit("update:modelValue", "");
  if (fileInputRef.value) fileInputRef.value.value = "";
}

function setupCanvas() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;

  const dpr = window.devicePixelRatio || 1;
  // Save content if already drawn
  let backup: HTMLImageElement | null = null;
  if (hasDrawn.value) {
    const tempUrl = canvas.toDataURL("image/png");
    backup = new Image();
    backup.src = tempUrl;
  }

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(dpr, dpr);

  if (backup) {
    backup.onload = () => {
      ctx.drawImage(backup!, 0, 0, rect.width, rect.height);
    };
  }
}

function triggerFileUpload() {
  fileInputRef.value?.click();
}

function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const result = e.target?.result as string;
    if (!result) return;
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.value;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      // Fit image neatly inside canvas with aspect ratio maintained
      const scale = Math.min((rect.width - 20) / img.width, (rect.height - 20) / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      const x = (rect.width - w) / 2;
      const y = (rect.height - h) / 2;
      ctx.drawImage(img, x, y, w, h);
      hasDrawn.value = true;
      emitSignature();
    };
    img.src = result;
  };
  reader.readAsDataURL(file);
}

onMounted(() => {
  nextTick(() => {
    setupCanvas();
    if (canvasRef.value) {
      resizeObserver = new ResizeObserver(() => {
        setupCanvas();
      });
      resizeObserver.observe(canvasRef.value);
    }
  });
});

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});

defineExpose({
  clear,
  hasDrawn,
});
</script>

<template>
  <div class="signature-pad-block">
    <div class="signature-pad-header">
      <div class="signature-pad-title-wrap">
        <label class="signature-label">Signature</label>
        <span class="signature-hint">(Optional — sign or doodle below)</span>
      </div>
      <div class="signature-pad-actions">
        <div class="signature-palette" role="radiogroup" aria-label="Signature ink color">
          <button v-for="color in colors" :key="color.value" type="button" class="palette-chip"
            :class="{ active: selectedColor === color.value }" :style="{ backgroundColor: color.value }"
            :title="color.label" :disabled="disabled" @click="selectedColor = color.value" />
        </div>
        <button type="button" class="signature-sub-btn" title="Upload signature image" :disabled="disabled"
          @click="triggerFileUpload">
          Upload
        </button>
        <button v-if="hasDrawn" type="button" class="signature-sub-btn signature-clear-btn" :disabled="disabled"
          @click="clear">
          Clear
        </button>
        <input ref="fileInputRef" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" class="hidden"
          @change="handleFileUpload" />
      </div>
    </div>

    <div class="signature-canvas-wrapper" :class="{ 'is-disabled': disabled }">
      <canvas ref="canvasRef" class="signature-canvas" @mousedown="startDrawing" @mousemove="draw"
        @mouseup="stopDrawing" @mouseleave="stopDrawing" @touchstart.prevent="startTouchDrawing"
        @touchmove.prevent="touchDraw" @touchend.prevent="stopDrawing" />
      <div v-if="!hasDrawn" class="signature-watermark" aria-hidden="true">
        <span>✍️ Draw your signature here...</span>
      </div>
    </div>
  </div>
</template>
