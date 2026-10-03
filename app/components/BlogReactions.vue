<script setup lang="ts">
import { computed, ref } from "vue";
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
  if (!props.currentUser) {
    window.location.href = "/api/auth/github";
    return;
  }
  if (toggling.value) return;
  toggling.value = true;

  // Optimistic update
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
    // Revert optimistic update on failure
    console.error("Failed to toggle reaction:", err);
  } finally {
    toggling.value = false;
  }
}
</script>

<template>
  <div class="blog-reactions-bar">
    <span class="blog-reactions-title">Reactions</span>
    <div class="blog-reactions-list">
      <button
        v-for="btn in reactionButtons"
        :key="btn.type"
        type="button"
        class="blog-reaction-btn"
        :class="{ active: reactions.userReactions.includes(btn.type) }"
        :title="currentUser ? `React with ${btn.label}` : 'Sign in with GitHub to react'"
        @click="toggleReaction(btn.type)"
      >
        <span class="reaction-emoji">{{ btn.emoji }}</span>
        <span v-if="reactions.counts[btn.type] > 0" class="reaction-count">
          {{ reactions.counts[btn.type] }}
        </span>
      </button>
    </div>
  </div>
</template>
