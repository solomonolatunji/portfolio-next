import { getGuestbookSession } from "#server/utils/guestbook";
import { isAdminUser } from "#server/utils/admin";

export default defineEventHandler(async (event) => {
  try {
    const user = await getGuestbookSession(event);
    return {
      user: user
        ? {
            ...user,
            isAdmin: isAdminUser(user),
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
