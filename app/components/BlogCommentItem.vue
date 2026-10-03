<script setup lang="ts">
import { ref } from "vue";
import { siteConfig } from "@/constants/site";
import type { BlogComment } from "@/interfaces/blog";
import type { GuestbookUser } from "@/interfaces/guestbook";
import { formatDate } from "@/utils/date";

const props = defineProps<{
  comment: BlogComment;
  currentUser: GuestbookUser | null;
  replyingToId: number | null;
  submitting: boolean;
  defaultGuestName?: string;
  defaultGuestEmail?: string;
}>();

const emit = defineEmits<{
  (e: "toggle-reaction", comment: BlogComment): void;
  (e: "toggle-reply", id: number): void;
  (e: "submit-reply", payload: { parentId: number; content: string; guestName?: string; guestEmail?: string }): void;
}>();

const replyContent = ref("");
const replyGuestName = ref(props.defaultGuestName || "");
const replyGuestEmail = ref(props.defaultGuestEmail || "");

function onReplySubmit() {
  if (!replyContent.value.trim() || props.submitting) return;
  emit("submit-reply", {
    parentId: props.comment.id,
    content: replyContent.value.trim(),
    guestName: !props.currentUser ? replyGuestName.value.trim() : undefined,
    guestEmail: !props.currentUser ? replyGuestEmail.value.trim() : undefined,
  });
  replyContent.value = "";
}
</script>

<template>
  <article class="blog-comment-node">
    <div class="comment-author-row">
      <img
        v-if="comment.author.avatarUrl"
        :src="comment.author.avatarUrl"
        :alt="comment.author.username"
        class="comment-avatar"
        loading="lazy"
      />
      <div class="comment-author-info">
        <div class="author-name-group">
          <a
            v-if="comment.author.profileUrl"
            :href="comment.author.profileUrl"
            target="_blank"
            rel="noreferrer"
            class="author-name-link"
          >
            {{ comment.author.username }}
          </a>
          <span v-else class="author-name-static">{{ comment.author.username }}</span>

          <span
            v-if="comment.author.username === siteConfig.adminUsername"
            class="author-badge"
          >
            Author
          </span>
        </div>
        <time>{{ formatDate(comment.createdAt) }}</time>
      </div>
    </div>

    <p class="comment-body">{{ comment.content }}</p>

    <!-- Actions: Reaction & Reply -->
    <div class="comment-actions-bar">
      <button
        type="button"
        class="comment-reaction-btn"
        :class="{ active: comment.userReacted }"
        title="Like this comment"
        @click="emit('toggle-reaction', comment)"
      >
        <span>{{ comment.userReacted ? '❤️' : '🤍' }}</span>
        <span v-if="comment.reactionCount > 0" class="comment-reaction-count">
          {{ comment.reactionCount }}
        </span>
      </button>

      <button
        type="button"
        class="reply-trigger-btn"
        @click="emit('toggle-reply', comment.id)"
      >
        {{ replyingToId === comment.id ? 'Cancel' : 'Reply' }}
      </button>
    </div>

    <!-- Inline Reply Composer -->
    <div v-if="replyingToId === comment.id" class="inline-reply-composer">
      <div v-if="!currentUser" class="composer-guest-row mb-2">
        <input
          v-model="replyGuestName"
          type="text"
          placeholder="Your name *"
          required
          class="guestbook-input guest-input-sm"
        />
        <input
          v-model="replyGuestEmail"
          type="email"
          placeholder="Email (optional)"
          class="guestbook-input guest-input-sm"
        />
      </div>

      <textarea
        v-model="replyContent"
        placeholder="Write a reply..."
        rows="2"
        maxlength="1000"
        :disabled="submitting"
        class="guestbook-textarea w-full"
        autofocus
      ></textarea>
      <div class="inline-reply-actions">
        <button
          type="button"
          class="cancel-btn"
          :disabled="submitting"
          @click="emit('toggle-reply', comment.id)"
        >
          Cancel
        </button>
        <button
          type="button"
          class="guestbook-button"
          :disabled="submitting || !replyContent.trim() || (!currentUser && !replyGuestName.trim())"
          @click="onReplySubmit"
        >
          {{ submitting ? 'Replying...' : 'Reply' }}
        </button>
      </div>
    </div>

    <!-- Nested Replies -->
    <div v-if="comment.replies && comment.replies.length > 0" class="nested-replies-list">
      <article v-for="reply in comment.replies" :key="reply.id" class="nested-reply-node">
        <div class="comment-author-row">
          <img
            v-if="reply.author.avatarUrl"
            :src="reply.author.avatarUrl"
            :alt="reply.author.username"
            class="comment-avatar small"
            loading="lazy"
          />
          <div class="comment-author-info">
            <div class="author-name-group">
              <a
                v-if="reply.author.profileUrl"
                :href="reply.author.profileUrl"
                target="_blank"
                rel="noreferrer"
                class="author-name-link"
              >
                {{ reply.author.username }}
              </a>
              <span v-else class="author-name-static">{{ reply.author.username }}</span>

              <span
                v-if="reply.author.username === siteConfig.adminUsername"
                class="author-badge"
              >
                Author
              </span>
            </div>
            <time>{{ formatDate(reply.createdAt) }}</time>
          </div>
        </div>

        <p class="comment-body">{{ reply.content }}</p>

        <!-- Reaction on Reply -->
        <div class="comment-actions-bar">
          <button
            type="button"
            class="comment-reaction-btn"
            :class="{ active: reply.userReacted }"
            title="Like this reply"
            @click="emit('toggle-reaction', reply)"
          >
            <span>{{ reply.userReacted ? '❤️' : '🤍' }}</span>
            <span v-if="reply.reactionCount > 0" class="comment-reaction-count">
              {{ reply.reactionCount }}
            </span>
          </button>
        </div>
      </article>
    </div>
  </article>
</template>
