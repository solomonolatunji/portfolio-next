<script setup lang="ts">
import { ref } from "vue";
import type { BlogReactionsSummary, BlogReactionType } from "@/interfaces/blog";
import type { GuestbookUser } from "@/interfaces/guestbook";

const props = defineProps<{
  postId: number;
  initialReactions: BlogReactionsSummary;
  currentUser: GuestbookUser | null;
}>();

const reactions = ref<BlogReactionsSummary>({
  counts: { ...props.initialReactions.counts },
  userReactions: [...props.initialReactions.userReactions],
  total: props.initialReactions.total,
});

const toggling = ref(false);

const reactionButtons: { type: BlogReactionType; emoji: string; label: string }[] = [
  { type: "heart", emoji: "❤️", label: "Love" },
  { type: "fire", emoji: "🔥", label: "Fire" },
  { type: "rocket", emoji: "🚀", label: "Rocket" },
  { type: "like", emoji: "👍", label: "Like" },
  { type: "bulb", emoji: "💡", label: "Clever" },
];

async function toggleReaction(type: BlogReactionType) {
  if (toggling.value) return;
  toggling.value = true;

  const hasReacted = reactions.value.userReactions.includes(type);
  if (hasReacted) {
    reactions.value.userReactions = reactions.value.userReactions.filter((r) => r !== type);
    reactions.value.counts[type] = Math.max(0, (reactions.value.counts[type] || 0) - 1);
    reactions.value.total = Math.max(0, reactions.value.total - 1);
  } else {
    reactions.value.userReactions.push(type);
    reactions.value.counts[type] = (reactions.value.counts[type] || 0) + 1;
    reactions.value.total += 1;
  }

  try {
    const res = await $fetch<{
      reacted: boolean;
      reactions: BlogReactionsSummary;
    }>(`/api/posts/${props.postId}/reactions` as string, {
      method: "POST",
      body: { reactionType: type },
    });
    reactions.value = res.reactions;
  } catch (err) {
    console.error("Failed to toggle reaction:", err);
  } finally {
    toggling.value = false;
  }
}
</script>

<template>
  <div
    class="border-line bg-card/60 my-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border px-5 py-3.5 backdrop-blur-xs"
  >
    <div class="text-muted flex items-center gap-2 text-sm font-medium">
      <span>Reactions</span>
      <span v-if="reactions.total > 0" class="bg-chip text-soft rounded-full px-2 py-0.5 text-xs">
        {{ reactions.total }}
      </span>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <button
        v-for="btn in reactionButtons"
        :key="btn.type"
        type="button"
        class="inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
        :class="
          reactions.userReactions.includes(btn.type)
            ? 'border-line-strong bg-chip text-ink shadow-xs'
            : 'border-line text-muted hover:border-line-strong hover:bg-card hover:text-ink bg-transparent'
        "
        :title="`React with ${btn.label}`"
        :disabled="toggling"
        @click="toggleReaction(btn.type)"
      >
        <span class="text-sm leading-none">{{ btn.emoji }}</span>
        <span v-if="reactions.counts[btn.type] > 0" class="tabular-nums">
          {{ reactions.counts[btn.type] }}
        </span>
      </button>
    </div>
  </div>
</template>
