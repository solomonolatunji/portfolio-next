<script setup lang="ts">
import { onMounted, ref } from "vue";
import GitHubIcon from "@/components/icons/GitHubIcon.vue";
import { siteConfig } from "@/constants/site";
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
const guestName = ref("");
const guestEmail = ref("");
const submitting = ref(false);
const replyingToId = ref<number | null>(null);
const replyContent = ref("");
const replyGuestName = ref("");
const replyGuestEmail = ref("");
const error = ref("");

onMounted(() => {
  const savedName = localStorage.getItem("blog_guest_name");
  const savedEmail = localStorage.getItem("blog_guest_email");
  if (savedName) {
    guestName.value = savedName;
    replyGuestName.value = savedName;
  }
  if (savedEmail) {
    guestEmail.value = savedEmail;
    replyGuestEmail.value = savedEmail;
  }
});

function saveGuestInfo(name: string, email: string) {
  if (name) localStorage.setItem("blog_guest_name", name);
  if (email) localStorage.setItem("blog_guest_email", email);
}

async function submitComment(parentId: number | null = null) {
  const content = parentId ? replyContent.value.trim() : newCommentContent.value.trim();
  const name = parentId ? replyGuestName.value.trim() : guestName.value.trim();
  const email = parentId ? replyGuestEmail.value.trim() : guestEmail.value.trim();

  if (!content || submitting.value) return;

  if (!props.currentUser && !name) {
    error.value = "Please enter your name to post a comment.";
    return;
  }

  submitting.value = true;
  error.value = "";

  try {
    const created = await $fetch<BlogComment>(`/api/posts/${props.postId}/comments` as string, {
      method: "POST",
      body: {
        content,
        parentId,
        guestName: !props.currentUser ? name : undefined,
        guestEmail: !props.currentUser ? email : undefined,
      },
    });

    if (!props.currentUser && name) {
      saveGuestInfo(name, email);
    }

    if (parentId) {
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

async function toggleCommentReaction(comment: BlogComment) {
  const previousReacted = comment.userReacted;
  const previousCount = comment.reactionCount;

  comment.userReacted = !previousReacted;
  comment.reactionCount = previousReacted ? Math.max(0, previousCount - 1) : previousCount + 1;

  try {
    const res = await $fetch<{ reacted: boolean; reactionCount: number }>(
      `/api/comments/${comment.id}/reactions` as string,
      { method: "POST" }
    );
    comment.userReacted = res.reacted;
    comment.reactionCount = res.reactionCount;
  } catch (err) {
    comment.userReacted = previousReacted;
    comment.reactionCount = previousCount;
    console.error("Failed to toggle reaction on comment:", err);
  }
}

function toggleReply(id: number) {
  if (replyingToId.value === id) {
    replyingToId.value = null;
    replyContent.value = "";
  } else {
    replyingToId.value = id;
    replyContent.value = "";
    if (guestName.value) {
      replyGuestName.value = guestName.value;
    }
    if (guestEmail.value) {
      replyGuestEmail.value = guestEmail.value;
    }
  }
}
</script>

<template>
  <section class="blog-comments-section">
    <div class="blog-comments-header">
      <h3>Discussion</h3>
      <span class="blog-comments-count">{{ comments.length }} {{ comments.length === 1 ? 'comment' : 'comments' }}</span>
    </div>

    <!-- Main Comment Composer -->
    <div class="blog-comment-composer">
      <!-- User info header if logged in -->
      <div v-if="currentUser" class="composer-user-meta">
        <img
          v-if="currentUser.avatarUrl"
          :src="currentUser.avatarUrl"
          :alt="currentUser.username"
          class="composer-avatar"
        />
        <span>Commenting as <strong>{{ currentUser.username }}</strong></span>
      </div>

      <!-- Guest name inputs if not logged in -->
      <div v-else class="composer-guest-row">
        <div class="guest-field">
          <input
            v-model="guestName"
            type="text"
            placeholder="Your name *"
            required
            class="guestbook-input guest-input-sm"
          />
        </div>
        <div class="guest-field">
          <input
            v-model="guestEmail"
            type="email"
            placeholder="Email (optional, for avatar)"
            class="guestbook-input guest-input-sm"
          />
        </div>
        <div class="guest-github-hint">
          <span>or</span>
          <a href="/api/auth/github" class="github-mini-link" rel="external">
            <GitHubIcon />
            Sign in
          </a>
        </div>
      </div>

      <form @submit.prevent="submitComment(null)">
        <textarea
          v-model="newCommentContent"
          placeholder="Share your thoughts or feedback..."
          rows="3"
          maxlength="1000"
          :disabled="submitting"
          class="guestbook-textarea w-full"
        ></textarea>
        <div class="composer-actions">
          <button
            type="submit"
            class="guestbook-button"
            :disabled="submitting || !newCommentContent.trim() || (!currentUser && !guestName.trim())"
          >
            {{ submitting ? 'Posting...' : 'Post Comment' }}
          </button>
        </div>
      </form>
    </div>

    <p v-if="error" class="guestbook-alert error" role="alert">{{ error }}</p>

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
            @click="toggleCommentReaction(comment)"
          >
            <span>{{ comment.userReacted ? '❤️' : '🤍' }}</span>
            <span v-if="comment.reactionCount > 0" class="comment-reaction-count">
              {{ comment.reactionCount }}
            </span>
          </button>

          <button
            type="button"
            class="reply-trigger-btn"
            @click="toggleReply(comment.id)"
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
              @click="toggleReply(comment.id)"
            >
              Cancel
            </button>
            <button
              type="button"
              class="guestbook-button"
              :disabled="submitting || !replyContent.trim() || (!currentUser && !replyGuestName.trim())"
              @click="submitComment(comment.id)"
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
                @click="toggleCommentReaction(reply)"
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
    </div>

    <p v-else class="blog-comments-empty">
      No comments yet. Be the first to share your thoughts!
    </p>
  </section>
</template>
