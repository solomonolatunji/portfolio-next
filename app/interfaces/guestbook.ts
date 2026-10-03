export interface GuestbookUser {
  id: string;
  username: string;
  avatarUrl: string | null;
  profileUrl: string;
  isAdmin?: boolean;
}

export interface GuestbookEntry {
  id: number;
  message: string;
  signatureUrl?: string | null;
  createdAt: string;
  username: string;
  avatarUrl: string | null;
  profileUrl: string;
}

export type User = GuestbookUser;
export type Entry = GuestbookEntry;
