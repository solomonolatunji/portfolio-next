import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import SiteFooter from "../../app/components/SiteFooter.vue";

describe("SiteFooter", () => {
  it("exposes the guestbook link", async () => {
    const wrapper = await mountSuspended(SiteFooter);
    expect(wrapper.get("a").attributes("href")).toBe("/guestbook");
  });
});
