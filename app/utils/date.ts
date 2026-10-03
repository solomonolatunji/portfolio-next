const DATE_TIME_FORMAT: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
};

function format(date: Date): string {
  return new Intl.DateTimeFormat("en-US", DATE_TIME_FORMAT).format(date);
}

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
      const fallback = new Date(value);
      if (!Number.isNaN(fallback.getTime())) {
        return format(fallback);
      }
      return String(value);
    }

    return format(date);
  } catch {
    return String(value ?? "");
  }
}
