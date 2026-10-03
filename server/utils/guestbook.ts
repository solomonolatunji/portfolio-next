import { and, eq, gt } from "drizzle-orm";
import type { H3Event } from "nitropack/types";
import { getDb } from "#server/db";
import { sessions, users } from "#server/db/schema";
import type { GuestbookEnv } from "./types";

const SESSION_COOKIE = "guestbook_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export interface GuestbookUser {
  id: string;
  username: string;
  avatarUrl: string | null;
  profileUrl: string;
  isAdmin?: boolean;
}

function required(value: string | undefined, name: string) {
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

async function hash(value: string) {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function isSecure(event: H3Event) {
  return getRequestURL(event).protocol === "https:";
}

export function githubAuthorizationUrl(env: GuestbookEnv, event: H3Event, state: string) {
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", required(env.GITHUB_CLIENT_ID, "GITHUB_CLIENT_ID"));
  url.searchParams.set(
    "redirect_uri",
    new URL("/api/auth/github/callback", getRequestURL(event)).toString()
  );
  url.searchParams.set("scope", "read:user");
  url.searchParams.set("state", state);
  return url;
}

export function newState() {
  return crypto.randomUUID();
}

export function setOAuthState(event: H3Event, state: string) {
  setCookie(event, "guestbook_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecure(event),
    maxAge: 600,
    path: "/",
  });
}

export function getOAuthState(event: H3Event) {
  return getCookie(event, "guestbook_oauth_state");
}

export async function exchangeGithubCode(code: string, env: GuestbookEnv, event: H3Event) {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: required(env.GITHUB_CLIENT_ID, "GITHUB_CLIENT_ID"),
      client_secret: required(env.GITHUB_CLIENT_SECRET, "GITHUB_CLIENT_SECRET"),
      code,
      redirect_uri: new URL("/api/auth/github/callback", getRequestURL(event)).toString(),
    }),
  });
  const payload = (await response.json()) as { access_token?: string; error_description?: string };
  if (!response.ok || !payload.access_token)
    throw new Error(payload.error_description || "GitHub authorization failed.");
  return payload.access_token;
}

export async function fetchGithubUser(accessToken: string) {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "Solomon-Portfolio-Guestbook",
    },
  });
  if (!response.ok) throw new Error("Could not retrieve your GitHub profile.");
  const user = (await response.json()) as {
    id: number;
    login: string;
    name?: string | null;
    avatar_url?: string;
    html_url: string;
  };
  return {
    id: String(user.id),
    username: user.name?.trim() || user.login,
    avatarUrl: user.avatar_url || null,
    profileUrl: user.html_url,
  } satisfies GuestbookUser;
}

export async function createSession(user: GuestbookUser) {
  const token = crypto.randomUUID();
  const sessionId = await hash(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
  const db = getDb();
  await db
    .insert(users)
    .values({
      id: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      profileUrl: user.profileUrl,
    })
    .onDuplicateKeyUpdate({
      set: {
        username: user.username,
        avatarUrl: user.avatarUrl,
        profileUrl: user.profileUrl,
      },
    });
  await db.insert(sessions).values({ id: sessionId, userId: user.id, expiresAt });
  return { token, expiresAt };
}

export async function getGuestbookSession(event: H3Event) {
  const token = getCookie(event, SESSION_COOKIE);
  if (!token) return null;
  const db = getDb();
  const result = await db
    .select({
      id: users.id,
      username: users.username,
      avatarUrl: users.avatarUrl,
      profileUrl: users.profileUrl,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.id, await hash(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return result[0] || null;
}

export async function clearGuestbookSession(event: H3Event) {
  const token = getCookie(event, SESSION_COOKIE);
  if (!token) return;
  const db = getDb();
  await db.delete(sessions).where(eq(sessions.id, await hash(token)));
}

export function setSessionCookie(event: H3Event, token: string) {
  setCookie(event, SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecure(event),
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  });
}

export function clearSessionCookie(event: H3Event) {
  setCookie(event, SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecure(event),
    maxAge: 0,
    path: "/",
  });
}
