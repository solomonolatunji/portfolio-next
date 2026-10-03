import "dotenv/config";

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;

async function debug() {
  const basicAuth = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64");
  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: SPOTIFY_REFRESH_TOKEN,
    }),
  });
  const tokenData = await tokenRes.json();
  const token = tokenData.access_token;
  console.log("Token scopes granted:", tokenData.scope);

  // 1. Check /me/player
  const playerRes = await fetch("https://api.spotify.com/v1/me/player", {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("/me/player HTTP status:", playerRes.status);
  if (playerRes.status === 200) {
    const data = await playerRes.json();
    console.log("Full player state:", JSON.stringify({
      is_playing: data.is_playing,
      currently_playing_type: data.currently_playing_type,
      item_name: data.item?.name,
      artists: data.item?.artists?.map((a) => a.name),
      device: data.device?.name,
      device_is_active: data.device?.is_active,
    }, null, 2));
  } else {
    console.log("/me/player body:", await playerRes.text());
  }

  // 2. Check /me/player/currently-playing
  const currRes = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("/me/player/currently-playing HTTP status:", currRes.status);
  if (currRes.status === 200) {
    const data = await currRes.json();
    console.log("Currently-playing state:", JSON.stringify({
      is_playing: data.is_playing,
      currently_playing_type: data.currently_playing_type,
      item_name: data.item?.name,
      artists: data.item?.artists?.map((a) => a.name),
    }, null, 2));
  } else {
    console.log("/me/player/currently-playing body:", await playerRes.text());
  }

  // 3. Check /me/player/devices
  const devRes = await fetch("https://api.spotify.com/v1/me/player/devices", {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("/me/player/devices HTTP status:", devRes.status);
  if (devRes.status === 200) {
    const data = await devRes.json();
    console.log("Devices:", JSON.stringify(data.devices, null, 2));
  }
}

debug().catch(console.error);
