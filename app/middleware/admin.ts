import type { GuestbookUser } from "@/interfaces/guestbook";

export default defineNuxtRouteMiddleware(async () => {
  try {
    const { user } = await $fetch<{ user: GuestbookUser | null }>("/api/auth/me");
    if (!user || !user.isAdmin) {
      return navigateTo("/blog");
    }
  } catch {
    return navigateTo("/blog");
  }
});
