export function formatDate(value: string | number | Date | null | undefined): string {
  if (!value) return "";
  try {
    let date: Date;
    if (value instanceof Date) {
      date = value;
    } else if (typeof value === "string") {
      if (value.includes("T") || value.endsWith("Z")) {
        date = new Date(value);
      } else if (value.includes(" ")) {
        date = new Date(value.replace(" ", "T") + "Z");
      } else {
        date = new Date(value);
      }
    } else {
      date = new Date(value);
    }

    if (Number.isNaN(date.getTime())) {
      const fallback = new Date(value as any);
      if (!Number.isNaN(fallback.getTime())) {
        return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(fallback);
      }
      return String(value);
    }

    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
  } catch {
    return String(value ?? "");
  }
}
