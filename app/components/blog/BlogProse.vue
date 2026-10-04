<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from "vue";

const props = defineProps<{
  content: string;
}>();

const containerRef = ref<HTMLElement | null>(null);

function attachCopyButtons() {
  if (typeof window === "undefined" || !containerRef.value) return;
  const blocks = containerRef.value.querySelectorAll("pre");
  blocks.forEach((pre) => {
    if (pre.querySelector(".copy-code-btn")) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className =
      "copy-code-btn absolute top-3 right-3 rounded-md border border-neutral-700 bg-neutral-900/80 px-2 py-1 text-[0.68rem] font-mono text-neutral-400 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-white hover:border-neutral-500 transition-all cursor-pointer backdrop-blur-sm select-none";
    btn.innerText = "Copy";
    btn.setAttribute("aria-label", "Copy code");
    btn.addEventListener("click", async () => {
      const codeEl = pre.querySelector("code");
      const textToCopy = codeEl ? codeEl.innerText : pre.innerText;
      try {
        await navigator.clipboard.writeText(textToCopy.trim());
        btn.innerText = "Copied!";
        btn.classList.add("text-emerald-400", "border-emerald-500/40");
        setTimeout(() => {
          btn.innerText = "Copy";
          btn.classList.remove("text-emerald-400", "border-emerald-500/40");
        }, 2000);
      } catch (err) {
        console.error("Failed to copy code snippet:", err);
      }
    });
    pre.appendChild(btn);
  });
}

onMounted(() => {
  nextTick(attachCopyButtons);
});

watch(
  () => props.content,
  () => {
    nextTick(attachCopyButtons);
  }
);
</script>

<template>
  <div
    ref="containerRef"
    class="text-ink [&_h1]:text-ink [&_h2]:text-ink [&_h3]:text-ink [&_p]:text-muted [&_a]:text-ink [&_ul]:text-muted [&_ol]:text-muted [&_blockquote]:border-line-strong [&_blockquote]:text-soft [&_code]:bg-elevated [&_code]:border-line [&_pre]:bg-elevated [&_pre]:border-line [&_img]:border-line [&_hr]:border-line/60 [&_pre]:group my-8 space-y-4 text-sm leading-relaxed md:text-base [&_a]:underline [&_a]:hover:text-white [&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:rounded [&_code]:border [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:text-emerald-300 [&_h1]:mt-8 [&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mt-6 [&_h2]:mb-2.5 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_hr]:my-8 [&_img]:my-6 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl [&_img]:border [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5 [&_p]:mb-4 [&_p]:leading-relaxed [&_pre]:relative [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:p-4 [&_pre_code]:border-none [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5"
    v-html="content"
  />
</template>
