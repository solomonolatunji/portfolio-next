import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import SiteHeader from "../../app/components/layout/SiteHeader.vue";

describe("SiteHeader", () => {
  it("renders the primary links without the legacy SO/26 brand", async () => {
    const wrapper = await mountSuspended(SiteHeader, { props: { isAdmin: false } });
    const text = wrapper.text();
    expect(text).toContain("Home");
    expect(text).toContain("Blog");
    expect(text).toContain("Guestbook");
    expect(text).not.toContain("SO");
    expect(text).not.toContain("/26");
    expect(wrapper.find("a[href='/admin/blog']").exists()).toBe(false);
  }, 30000);

  it("shows the admin link for admins", async () => {
    const wrapper = await mountSuspended(SiteHeader, { props: { isAdmin: true } });
    expect(wrapper.find("a[href='/admin/blog']").exists()).toBe(true);
  }, 30000);

  it("toggles the mobile menu", async () => {
    const wrapper = await mountSuspended(SiteHeader, { props: { isAdmin: true } });
    const button = wrapper.find("button[aria-expanded]");
    expect(button.attributes("aria-expanded")).toBe("false");
    expect(wrapper.find("#mobile-menu").exists()).toBe(false);

    await button.trigger("click");
    expect(button.attributes("aria-expanded")).toBe("true");
    const panel = wrapper.get("#mobile-menu");
    expect(panel.text()).toContain("Guestbook");
    expect(panel.find("a[href='/admin/blog']").exists()).toBe(true);

    await button.trigger("click");
    expect(button.attributes("aria-expanded")).toBe("false");
    expect(wrapper.find("#mobile-menu").exists()).toBe(false);
  }, 30000);
});
