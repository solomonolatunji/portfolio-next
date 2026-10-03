<script setup lang="ts">
import { ref } from "vue";
import type { BlogComment } from "@/interfaces/blog";
import type { GuestbookUser } from "@/interfaces/guestbook";
import { formatDate } from "@/utils/date";

const siteConfig = useSiteConfig();

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
  (
    e: "submit-reply",
    payload: { parentId: number; content: string; guestName?: string; guestEmail?: string }
  ): void;
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
  <article
    class="border-line bg-card/60 hover:border-line-strong/60 flex flex-col gap-3 rounded-xl border p-4 transition-colors duration-150 sm:p-5"
  >
    <!-- Comment Author Row -->
    <div class="flex items-center gap-3">
      <img
        v-if="comment.author.avatarUrl"
        :src="comment.author.avatarUrl"
        :alt="comment.author.username"
        class="border-line bg-chip size-9 rounded-full border object-cover"
        loading="lazy"
      />
      <div class="flex min-w-0 flex-1 flex-col">
        <div class="flex flex-wrap items-center gap-2">
          <a
            v-if="comment.author.profileUrl"
            :href="comment.author.profileUrl"
            target="_blank"
            rel="noreferrer"
            class="text-ink text-sm font-semibold transition-colors hover:underline"
          >
            {{ comment.author.username }}
          </a>
          <span v-else class="text-ink text-sm font-semibold">
            {{ comment.author.username }}
          </span>

          <span
            v-if="comment.author.username === siteConfig.adminUsername"
            class="border-line-strong bg-chip text-ink rounded-full border px-2 py-0.5 text-[0.68rem] font-semibold"
          >
            Author
          </span>
        </div>
        <time class="text-soft text-xs">{{ formatDate(comment.createdAt) }}</time>
      </div>
    </div>

    <!-- Comment Body -->
    <p class="text-muted text-sm leading-relaxed break-words whitespace-pre-wrap">
      {{ comment.content }}
    </p>

    <!-- Actions: Reaction & Reply -->
    <div class="flex items-center gap-3 pt-1">
      <button
        type="button"
        class="inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all"
        :class="
          comment.userReacted
            ? 'border-line-strong bg-chip text-ink'
            : 'border-line text-soft hover:border-line-strong hover:text-ink bg-transparent'
        "
        title="Like this comment"
        @click="emit('toggle-reaction', comment)"
      >
        <span>{{ comment.userReacted ? "❤️" : "🤍" }}</span>
        <span v-if="comment.reactionCount > 0" class="tabular-nums">
          {{ comment.reactionCount }}
        </span>
      </button>

      <button
        type="button"
        class="text-soft hover:text-ink cursor-pointer text-xs font-medium transition-colors"
        @click="emit('toggle-reply', comment.id)"
      >
        {{ replyingToId === comment.id ? "Cancel" : "Reply" }}
      </button>
    </div>

    <!-- Inline Reply Composer -->
    <div
      v-if="replyingToId === comment.id"
      class="border-line bg-elevated/80 mt-2 flex flex-col gap-3 rounded-lg border p-3 sm:p-4"
    >
      <div v-if="!currentUser" class="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input
          v-model="replyGuestName"
          type="text"
          placeholder="Your name *"
          required
          class="border-line bg-card text-ink placeholder:text-soft focus:border-line-strong rounded-lg border px-3 py-1.5 text-xs focus:outline-none"
        />
        <input
          v-model="replyGuestEmail"
          type="email"
          placeholder="Email (optional)"
          class="border-line bg-card text-ink placeholder:text-soft focus:border-line-strong rounded-lg border px-3 py-1.5 text-xs focus:outline-none"
        />
      </div>

      <textarea
        v-model="replyContent"
        placeholder="Write a reply..."
        rows="2"
        maxlength="1000"
        :disabled="submitting"
        class="border-line bg-card text-ink placeholder:text-soft focus:border-line-strong w-full resize-y rounded-lg border p-2.5 text-xs leading-relaxed focus:outline-none"
        autofocus
      ></textarea>

      <div class="flex items-center justify-end gap-2">
        <UButton
          size="xs"
          color="neutral"
          variant="ghost"
          :disabled="submitting"
          @click="emit('toggle-reply', comment.id)"
        >
          Cancel
        </UButton>
        <UButton
          size="xs"
          color="neutral"
          :loading="submitting"
          :disabled="submitting || !replyContent.trim() || (!currentUser && !replyGuestName.trim())"
          @click="onReplySubmit"
        >
          Reply
        </UButton>
      </div>
    </div>

    <!-- Nested Replies -->
    <div
      v-if="comment.replies && comment.replies.length > 0"
      class="border-line mt-2 flex flex-col gap-3 border-l-2 pl-3 sm:pl-5"
    >
      <article
        v-for="reply in comment.replies"
        :key="reply.id"
        class="border-line/60 bg-elevated/40 flex flex-col gap-2 rounded-lg border p-3"
      >
        <div class="flex items-center gap-2.5">
          <img
            v-if="reply.author.avatarUrl"
            :src="reply.author.avatarUrl"
            :alt="reply.author.username"
            class="border-line bg-chip size-7 rounded-full border object-cover"
            loading="lazy"
          />
          <div class="flex min-w-0 flex-1 flex-col">
            <div class="flex flex-wrap items-center gap-2">
              <a
                v-if="reply.author.profileUrl"
                :href="reply.author.profileUrl"
                target="_blank"
                rel="noreferrer"
                class="text-ink text-xs font-semibold transition-colors hover:underline"
              >
                {{ reply.author.username }}
              </a>
              <span v-else class="text-ink text-xs font-semibold">
                {{ reply.author.username }}
              </span>

              <span
                v-if="reply.author.username === siteConfig.adminUsername"
                class="border-line-strong bg-chip py-0.2 text-ink rounded-full border px-1.5 text-[0.62rem] font-semibold"
              >
                Author
              </span>
            </div>
            <time class="text-soft text-[0.68rem]">{{ formatDate(reply.createdAt) }}</time>
          </div>
        </div>

        <p class="text-muted text-xs leading-relaxed break-words whitespace-pre-wrap">
          {{ reply.content }}
        </p>

        <!-- Reaction on Reply -->
        <div class="flex items-center gap-2 pt-0.5">
          <button
            type="button"
            class="inline-flex cursor-pointer items-center gap-1 rounded-full border px-2 py-0.5 text-[0.68rem] font-medium transition-all"
            :class="
              reply.userReacted
                ? 'border-line-strong bg-chip text-ink'
                : 'border-line text-soft hover:border-line-strong hover:text-ink bg-transparent'
            "
            title="Like this reply"
            @click="emit('toggle-reaction', reply)"
          >
            <span>{{ reply.userReacted ? "❤️" : "🤍" }}</span>
            <span v-if="reply.reactionCount > 0" class="tabular-nums">
              {{ reply.reactionCount }}
            </span>
          </button>
        </div>
      </article>
    </div>
  </article>
</template>
