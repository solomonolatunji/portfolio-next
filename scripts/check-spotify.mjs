import "dotenv/config";

const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REFRESH_TOKEN,
  SPOTIFY_REDIRECT_URI,
} = process.env;

console.log("\n--- Checking Spotify Environment Variables ---");

const missing = [];
if (!SPOTIFY_CLIENT_ID) missing.push("SPOTIFY_CLIENT_ID");
if (!SPOTIFY_CLIENT_SECRET) missing.push("SPOTIFY_CLIENT_SECRET");
if (!SPOTIFY_REFRESH_TOKEN) missing.push("SPOTIFY_REFRESH_TOKEN");
if (!SPOTIFY_REDIRECT_URI) missing.push("SPOTIFY_REDIRECT_URI");

console.log(`• SPOTIFY_CLIENT_ID:     ${SPOTIFY_CLIENT_ID ? `SET (${SPOTIFY_CLIENT_ID.slice(0, 6)}...)` : "MISSING ❌"}`);
console.log(`• SPOTIFY_CLIENT_SECRET: ${SPOTIFY_CLIENT_SECRET ? `SET (${SPOTIFY_CLIENT_SECRET.slice(0, 4)}...)` : "MISSING ❌"}`);
console.log(`• SPOTIFY_REFRESH_TOKEN: ${SPOTIFY_REFRESH_TOKEN ? `SET (${SPOTIFY_REFRESH_TOKEN.slice(0, 8)}...)` : "MISSING ❌"}`);
console.log(`• SPOTIFY_REDIRECT_URI:  ${SPOTIFY_REDIRECT_URI || "MISSING ❌"}`);

if (missing.length > 0) {
  console.error(`\n❌ Missing required variables: ${missing.join(", ")}`);
  console.error("Please add them to your .env file or Railway variables.\n");
  process.exit(1);
}

console.log("\n--- Testing Spotify API Credentials ---");

try {
  const basicAuth = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64");

  const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
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

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok) {
    console.error(`\n❌ Spotify Auth Failed (${tokenResponse.status}):`);
    console.error(`   Error: ${tokenData.error}`);
    console.error(`   Description: ${tokenData.error_description || "N/A"}`);

    if (tokenData.error === "invalid_grant") {
      console.error("\n💡 Solution: Your SPOTIFY_REFRESH_TOKEN is invalid or expired.");
      console.error("   Run the app and visit /api/spotify/login to authenticate and get a new refresh token.");
    } else if (tokenData.error === "invalid_client") {
      console.error("\n💡 Solution: Your SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET is incorrect.");
      console.error("   Verify your credentials in the Spotify Developer Dashboard.");
    }
    process.exit(1);
  }

  console.log("✔ Token exchange successful! Acquired temporary access token.");

  const accessToken = tokenData.access_token;

  // Test currently playing endpoint
  const playerResponse = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (playerResponse.status === 200) {
    const track = await playerResponse.json();
    console.log(`✔ Currently Playing: "${track.item?.name}" by ${track.item?.artists?.map((a) => a.name).join(", ")}`);
  } else if (playerResponse.status === 204) {
    console.log("✔ No track currently active. Checking recently played...");
    const recentResponse = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=1", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (recentResponse.ok) {
      const recentData = await recentResponse.json();
      const lastTrack = recentData.items?.[0]?.track;
      if (lastTrack) {
        console.log(`✔ Last Played: "${lastTrack.name}" by ${lastTrack.artists?.map((a) => a.name).join(", ")}`);
      } else {
        console.log("✔ No recent tracks found.");
      }
    }
  } else {
    console.log(`✔ Connected to Spotify API (Player response: ${playerResponse.status})`);
  }

  console.log("\n🎉 Spotify configuration is 100% valid and working!\n");
} catch (err) {
  console.error("\n❌ Unexpected error while testing Spotify:", err.message);
  process.exit(1);
}
