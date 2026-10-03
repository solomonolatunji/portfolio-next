export function getDiceBearAvatar(seed: string): string {
  const safeSeed = encodeURIComponent(seed?.trim() || "Guest");
  return `https://api.dicebear.com/9.x/initials/svg?seed=${safeSeed}&backgroundColor=1f2937,374151,111827&textColor=f3f4f6`;
}

export function resolveAvatarUrl(authorName: string, avatarUrl?: string | null): string {
  if (avatarUrl && avatarUrl.trim()) {
    return avatarUrl.trim();
  }
  return getDiceBearAvatar(authorName);
}
