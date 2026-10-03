import { getGuestbookSession } from "#server/utils/guestbook";

export default defineEventHandler(async (event) => {
  try {
    return {
      user: await getGuestbookSession(event),
    };
  } catch (error) {
    console.error("Failed to retrieve guestbook session:", error);
    return {
      user: null,
    };
  }
});
