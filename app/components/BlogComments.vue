<script setup lang="ts">
import { onMounted, ref } from "vue";
import GitHubIcon from "@/components/icons/GitHubIcon.vue";
import BlogCommentItem from "@/components/BlogCommentItem.vue";
import type { BlogComment } from "@/interfaces/blog";
import type { GuestbookUser } from "@/interfaces/guestbook";

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
const error = ref("");

onMounted(() => {
  const savedName = localStorage.getItem("blog_guest_name");
  const savedEmail = localStorage.getItem("blog_guest_email");
  if (savedName) guestName.value = savedName;
  if (savedEmail) guestEmail.value = savedEmail;
});

function saveGuestInfo(name: string, email: string) {
  if (name) localStorage.setItem("blog_guest_name", name);
  if (email) localStorage.setItem("blog_guest_email", email);
}

async function submitComment(
  parentId: number | null = null,
  replyText?: string,
  replyName?: string,
  replyMail?: string
) {
  const content = parentId ? (replyText || "").trim() : newCommentContent.value.trim();
  const name = parentId ? (replyName || "").trim() : guestName.value.trim();
  const email = parentId ? (replyMail || "").trim() : guestEmail.value.trim();

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
            item.replies = item.replies || [];
            item.replies.push(created);
            return true;
          }
          if (item.replies && item.replies.length > 0 && addReply(item.replies)) {
            return true;
          }
        }
        return false;
      };
      addReply(comments.value);
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
  replyingToId.value = replyingToId.value === id ? null : id;
}

function handleReplySubmit(payload: {
  parentId: number;
  content: string;
  guestName?: string;
  guestEmail?: string;
}) {
  submitComment(payload.parentId, payload.content, payload.guestName, payload.guestEmail);
}
</script>

<template>
  <section class="mt-12 flex flex-col gap-6">
    <div class="border-line flex items-center justify-between border-b pb-4">
      <h3 class="text-ink text-xl font-bold tracking-tight">Discussion</h3>
      <span class="bg-chip text-soft rounded-full px-2.5 py-0.5 text-xs font-medium">
        {{ comments.length }} {{ comments.length === 1 ? "comment" : "comments" }}
      </span>
    </div>

    <!-- Main Comment Composer -->
    <div class="border-line bg-card/80 rounded-xl border p-4 sm:p-5">
      <div v-if="currentUser" class="mb-3 flex items-center gap-2.5">
        <img
          v-if="currentUser.avatarUrl"
          :src="currentUser.avatarUrl"
          :alt="currentUser.username"
          class="border-line size-6 rounded-full border object-cover"
        />
        <span class="text-muted text-xs">
          Commenting as <strong class="text-ink">{{ currentUser.username }}</strong>
        </span>
      </div>

      <div v-else class="mb-3 flex flex-wrap items-center gap-3">
        <input
          v-model="guestName"
          type="text"
          placeholder="Your name *"
          required
          class="border-line bg-elevated text-ink placeholder:text-soft focus:border-line-strong min-w-[140px] flex-1 rounded-lg border px-3 py-1.5 text-xs focus:outline-none"
        />
        <input
          v-model="guestEmail"
          type="email"
          placeholder="Email (optional, for avatar)"
          class="border-line bg-elevated text-ink placeholder:text-soft focus:border-line-strong min-w-[180px] flex-1 rounded-lg border px-3 py-1.5 text-xs focus:outline-none"
        />
        <div class="text-soft flex items-center gap-1.5 text-xs">
          <span>or</span>
          <a
            href="/api/auth/github"
            rel="external"
            class="text-ink inline-flex items-center gap-1 transition-colors hover:underline"
          >
            <GitHubIcon class="size-3.5" />
            <span>Sign in</span>
          </a>
        </div>
      </div>

      <form class="flex flex-col gap-3" @submit.prevent="submitComment(null)">
        <textarea
          v-model="newCommentContent"
          placeholder="Share your thoughts or feedback..."
          rows="3"
          maxlength="1000"
          :disabled="submitting"
          class="border-line bg-elevated text-ink placeholder:text-soft focus:border-line-strong w-full resize-y rounded-lg border p-3 text-sm leading-relaxed focus:outline-none"
        ></textarea>

        <div class="flex justify-end">
          <UButton
            type="submit"
            color="neutral"
            size="sm"
            :loading="submitting"
            :disabled="
              submitting || !newCommentContent.trim() || (!currentUser && !guestName.trim())
            "
          >
            Post Comment
          </UButton>
        </div>
      </form>
    </div>

    <UAlert v-if="error" color="error" variant="subtle" :title="error" />

    <!-- Comments List -->
    <div v-if="comments.length > 0" class="flex flex-col gap-4">
      <BlogCommentItem
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        :current-user="currentUser"
        :replying-to-id="replyingToId"
        :submitting="submitting"
        :default-guest-name="guestName"
        :default-guest-email="guestEmail"
        @toggle-reaction="toggleCommentReaction"
        @toggle-reply="toggleReply"
        @submit-reply="handleReplySubmit"
      />
    </div>

    <p v-else class="border-line text-soft rounded-xl border border-dashed p-8 text-center text-sm">
      No comments yet. Be the first to share your thoughts!
    </p>
  </section>
</template>
