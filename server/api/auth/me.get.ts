import { getGuestbookSession } from "#server/utils/guestbook";
import { isAdminUsername } from "#server/utils/admin";

export default defineEventHandler(async (event) => {
  try {
    const user = await getGuestbookSession(event);
    return {
      user: user
        ? {
            ...user,
            isAdmin: isAdminUsername(user.username),
          }
        : null,
    };
  } catch (error) {
    console.error("Failed to retrieve guestbook session:", error);
    return {
      user: null,
    };
  }
});
