import type { GuestbookUser } from "@/interfaces/guestbook";

export default defineNuxtRouteMiddleware(async (to) => {
  const requestFetch = useRequestFetch();
  try {
    const { user } = await requestFetch<{ user: GuestbookUser | null }>("/api/auth/me");
    if (!user || !user.isAdmin) {
      return navigateTo(`/admin/login?redirect=${encodeURIComponent(to.fullPath)}`);
    }
  } catch {
    return navigateTo(`/admin/login?redirect=${encodeURIComponent(to.fullPath)}`);
  }
});
