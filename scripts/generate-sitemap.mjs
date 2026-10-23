// Runs automatically before `npm run build` (see package.json "prebuild").
// Regenerates public/sitemap.xml from the static public routes plus every
// currently published article and DIY video, so the sitemap never drifts
// from what's actually in the database.
//
// If the API is unreachable (e.g. building offline, or the free Render
// instance is asleep), this falls back to the static routes only rather
// than failing the whole build.
//
// The domain comes from src/config/seo.js (one place to change it); the
// API from VITE_API_BASE_URL, like the app itself.

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { buildEntries, toXml } from "./sitemap-lib.mjs";

const API_BASE = `${(process.env.VITE_API_BASE_URL || "https://fixer-backend-7mng.onrender.com").replace(/\/$/, "")}/api`;

async function fetchJson(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error(`${url} -> ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn(`[sitemap] Skipping ${url}: ${err.message}`);
    return [];
  }
}

async function main() {
  const [articles, videos] = await Promise.all([
    fetchJson(`${API_BASE}/articles/published`),
    fetchJson(`${API_BASE}/diy-videos/published`),
  ]);

  const entries = buildEntries(articles, videos);
  const outPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "sitemap.xml");
  writeFileSync(outPath, toXml(entries));
  console.log(
    `[sitemap] Wrote ${entries.length} URLs (${articles.length} articles, ${videos.length} videos) to public/sitemap.xml`,
  );
}

main();
