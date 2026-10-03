<script setup lang="ts">
import { ref } from "vue";
import GitHubIcon from "@/components/icons/GitHubIcon.vue";
import type { BlogComment } from "@/interfaces/blog";
import type { GuestbookUser } from "@/interfaces/guestbook";
import { formatDate } from "@/utils/date";

const props = defineProps<{
  postId: number;
  initialComments: BlogComment[];
  currentUser: GuestbookUser | null;
}>();

const comments = ref<BlogComment[]>([...props.initialComments]);
const newCommentContent = ref("");
const submitting = ref(false);
const replyingToId = ref<number | null>(null);
const replyContent = ref("");
const error = ref("");

async function submitComment(parentId: number | null = null) {
  const content = parentId ? replyContent.value.trim() : newCommentContent.value.trim();
  if (!content || submitting.value) return;

  submitting.value = true;
  error.value = "";

  try {
    const created = await $fetch<BlogComment>(`/api/posts/${props.postId}/comments` as string, {
      method: "POST",
      body: { content, parentId },
    });

    if (parentId) {
      // Find parent in tree and push to replies
      const addReply = (list: BlogComment[]): boolean => {
        for (const item of list) {
          if (item.id === parentId) {
            item.replies.push(created);
            return true;
          }
          if (item.replies && item.replies.length > 0) {
            if (addReply(item.replies)) return true;
          }
        }
        return false;
      };
      addReply(comments.value);
      replyContent.value = "";
      replyingToId.value = null;
    } else {
      comments.value.push(created);
      newCommentContent.value = "";
    }
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : "Failed to post comment.";
  } finally {
    submitting.value = false;
  }
}

function toggleReply(id: number) {
  if (replyingToId.value === id) {
    replyingToId.value = null;
    replyContent.value = "";
  } else {
    replyingToId.value = id;
    replyContent.value = "";
  }
}
</script>

<template>
  <section class="blog-comments-section">
    <div class="blog-comments-header">
      <h3>Comments & Discussion</h3>
      <span class="blog-comments-count">{{ comments.length }} {{ comments.length === 1 ? 'comment' : 'comments' }}</span>
    </div>

    <!-- Main Comment Composer -->
    <div v-if="currentUser" class="blog-comment-composer">
      <div class="composer-user-meta">
        <img
          v-if="currentUser.avatarUrl"
          :src="currentUser.avatarUrl"
          :alt="currentUser.username"
          class="composer-avatar"
        />
        <span>Commenting as <strong>{{ currentUser.username }}</strong></span>
      </div>
      <form @submit.prevent="submitComment(null)">
        <UTextarea
          v-model="newCommentContent"
          placeholder="Share your thoughts or feedback..."
          :rows="3"
          :maxlength="1000"
          :disabled="submitting"
          class="w-full"
        />
        <div class="composer-actions">
          <UButton
            type="submit"
            size="sm"
            :loading="submitting"
            :disabled="!newCommentContent.trim()"
          >
            Post Comment
          </UButton>
        </div>
      </form>
    </div>

    <!-- Login CTA for Visitors -->
    <div v-else class="blog-comments-login-card">
      <p>Have thoughts to share or questions about this post?</p>
      <a href="/api/auth/github" class="guestbook-button" rel="external">
        <GitHubIcon />
        Sign in with GitHub to Comment
      </a>
    </div>

    <p v-if="error" class="guestbook-error" role="alert">{{ error }}</p>

    <!-- Comments List -->
    <div v-if="comments.length > 0" class="blog-comments-thread">
      <article v-for="comment in comments" :key="comment.id" class="blog-comment-node">
        <div class="comment-author-row">
          <img
            v-if="comment.author.avatarUrl"
            :src="comment.author.avatarUrl"
            :alt="comment.author.username"
            class="comment-avatar"
            loading="lazy"
          />
          <div class="comment-author-info">
            <a :href="comment.author.profileUrl" target="_blank" rel="noreferrer">
              {{ comment.author.username }}
            </a>
            <time>{{ formatDate(comment.createdAt) }}</time>
          </div>
        </div>

        <p class="comment-body">{{ comment.content }}</p>

        <div v-if="currentUser" class="comment-actions">
          <button
            type="button"
            class="reply-trigger-btn"
            @click="toggleReply(comment.id)"
          >
            {{ replyingToId === comment.id ? 'Cancel' : 'Reply' }}
          </button>
        </div>

        <!-- Inline Reply Composer -->
        <div v-if="replyingToId === comment.id && currentUser" class="inline-reply-composer">
          <UTextarea
            v-model="replyContent"
            placeholder="Write a reply..."
            :rows="2"
            :maxlength="1000"
            :disabled="submitting"
            class="w-full"
            autofocus
          />
          <div class="inline-reply-actions">
            <button
              type="button"
              class="cancel-btn"
              :disabled="submitting"
              @click="toggleReply(comment.id)"
            >
              Cancel
            </button>
            <UButton
              size="xs"
              :loading="submitting"
              :disabled="!replyContent.trim()"
              @click="submitComment(comment.id)"
            >
              Reply
            </UButton>
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
                <a :href="reply.author.profileUrl" target="_blank" rel="noreferrer">
                  {{ reply.author.username }}
                </a>
                <time>{{ formatDate(reply.createdAt) }}</time>
              </div>
            </div>
            <p class="comment-body">{{ reply.content }}</p>
          </article>
        </div>
      </article>
    </div>

    <p v-else class="blog-comments-empty">
      No comments yet. Be the first to start the conversation!
    </p>
  </section>
</template>
