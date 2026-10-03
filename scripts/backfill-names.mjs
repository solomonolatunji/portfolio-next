import "dotenv/config";
import mysql from "mysql2/promise";

const conn = await mysql.createConnection(process.env.MYSQL_URL);
const [rows] = await conn.execute("SELECT id, username, profile_url FROM users");

for (const row of rows) {
  const login = new URL(row.profile_url).pathname.split("/").filter(Boolean)[0];
  if (!login) continue;
  const res = await fetch(`https://api.github.com/users/${login}`, {
    headers: { "User-Agent": "Solomon-Portfolio-Guestbook" },
  });
  if (!res.ok) {
    console.log(`skip ${login}: ${res.status}`);
    continue;
  }
  const profile = await res.json();
  const name = profile.name?.trim() || profile.login;
  if (name !== row.username) {
    await conn.execute("UPDATE users SET username = ? WHERE id = ?", [name, row.id]);
    console.log(`${row.username} -> ${name}`);
  }
}

await conn.end();
