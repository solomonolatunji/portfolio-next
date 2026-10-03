import { expect, test } from "@nuxt/test-utils/playwright";

test("home page has the portfolio title and guestbook navigation", async ({ page, goto }) => {
  await goto("/", { waitUntil: "hydration" });
  await expect(page).toHaveTitle(/Solomon Olatunji/);
  await expect(page.getByRole("link", { name: "Guestbook" })).toBeVisible();
});

test("guestbook route renders", async ({ page, goto }) => {
  await goto("/guestbook", { waitUntil: "hydration" });
  await expect(page).toHaveTitle(/Guestbook/);
  await expect(page.getByRole("heading", { name: "Guestbook" })).toBeVisible();
});
