import type { MusicEnv } from "./types";

export interface ResolvedLinks {
  appleMusicUrl?: string;
  youtubeUrl?: string;
}

export interface SpotifyTrackResponse {
  is_playing: boolean;
  device?: {
    name?: string;
    type?: string;
  };
  item?: {
    name: string;
    external_urls?: { spotify?: string };
    album?: {
      name?: string;
      images?: Array<{ url: string }>;
    };
    artists?: Array<{ name: string }>;
    external_ids?: { isrc?: string };
  };
}

export interface SpotifyRecentTracksResponse {
  items?: Array<{
    track?: SpotifyTrackResponse["item"];
  }>;
}

export interface SpotifyDevicesResponse {
  devices?: Array<{
    id?: string | null;
    is_active?: boolean;
    name?: string;
    type?: string;
  }>;
}

export const SPOTIFY_SCOPES = [
  "user-read-currently-playing",
  "user-read-playback-state",
  "user-read-recently-played",
];

export function invariant(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export async function fetchJson<T>(
  url: string,
  init?: {
    method?: string;
    headers?: Record<string, string>;
    body?: URLSearchParams | string;
  }
): Promise<T> {
  const response = await fetch(url, {
    method: init?.method || "GET",
    headers: init?.headers,
    body: init?.body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${text}`);
  }

  return response.json() as Promise<T>;
}

export function basicAuth(clientId: string, clientSecret: string): string {
  return btoa(`${clientId}:${clientSecret}`);
}

export async function refreshSpotifyAccessToken(env: MusicEnv): Promise<string> {
  const clientId = invariant(env.SPOTIFY_CLIENT_ID, "SPOTIFY_CLIENT_ID");
  const clientSecret = invariant(env.SPOTIFY_CLIENT_SECRET, "SPOTIFY_CLIENT_SECRET");
  const refreshToken = invariant(env.SPOTIFY_REFRESH_TOKEN, "SPOTIFY_REFRESH_TOKEN");

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const response = await fetchJson<{
    access_token: string;
    token_type: string;
    expires_in: number;
  }>("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth(clientId, clientSecret)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  return response.access_token;
}

export async function fetchSpotifyNowPlaying(accessToken: string): Promise<SpotifyTrackResponse | null> {
  const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${text}`);
  }

  return (await response.json()) as SpotifyTrackResponse;
}

export async function fetchSpotifyRecentlyPlayed(
  accessToken: string
): Promise<SpotifyTrackResponse["item"] | null> {
  const response = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=1", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (response.status === 401 || response.status === 403) {
    return null;
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${text}`);
  }

  const data = (await response.json()) as SpotifyRecentTracksResponse;
  return data.items?.[0]?.track ?? null;
}

export async function fetchSpotifyActiveDevice(
  accessToken: string
): Promise<{ name?: string; type?: string } | null> {
  const response = await fetch("https://api.spotify.com/v1/me/player/devices", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (response.status === 401 || response.status === 403) {
    return null;
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${text}`);
  }

  const data = (await response.json()) as SpotifyDevicesResponse;
  return data.devices?.find((device) => device.is_active) ?? null;
}
