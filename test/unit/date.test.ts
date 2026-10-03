import { describe, expect, it } from "vitest";
import { formatDate } from "../../app/utils/date";

describe("formatDate", () => {
  it("formats ISO date strings without throwing RangeError", () => {
    const formatted = formatDate("2026-10-03T07:12:00.000Z");
    expect(formatted).toMatch(/2026/);
  });

  it("formats SQL datetime strings (YYYY-MM-DD HH:mm:ss)", () => {
    const formatted = formatDate("2026-10-03 07:12:00");
    expect(formatted).toMatch(/2026/);
  });

  it("formats Date instances", () => {
    const formatted = formatDate(new Date("2026-10-03T12:00:00Z"));
    expect(formatted).toMatch(/2026/);
  });

  it("handles null and undefined gracefully", () => {
    expect(formatDate(null)).toBe("");
    expect(formatDate(undefined)).toBe("");
    expect(formatDate("")).toBe("");
  });

  it("handles invalid time strings without throwing RangeError", () => {
    expect(() => formatDate("invalid-date-string")).not.toThrow();
    expect(formatDate("invalid-date-string")).toBe("invalid-date-string");
  });
});
