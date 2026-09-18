// Runs automatically before `npm run build` (see package.json "prebuild").
// Regenerates public/sitemap.xml from the static public routes plus every
// currently published article and DIY video, so the sitemap never drifts
// from what's actually in the database.
//
// If the API is unreachable (e.g. building offline, or the free Render
// instance is asleep), this falls back to the static routes only rather
// than failing the whole build.

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const SITE_URL = "https://fixerng.app";
const API_BASE = "https://fixer-backend-7mng.onrender.com/api";

const STATIC_ROUTES = [
  { loc: "/", priority: "1.0" },
  { loc: "/about", priority: "0.7" },
  { loc: "/blog", priority: "0.7" },
  { loc: "/contact", priority: "0.5" },
  { loc: "/community", priority: "0.5" },
  { loc: "/shipment-policy", priority: "0.4" },
  { loc: "/help", priority: "0.4" },
  { loc: "/privacy", priority: "0.2" },
  { loc: "/cookies", priority: "0.2" },
];

async function fetchJson(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error(`${url} -> ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[sitemap] Skipping ${url}: ${err.message}`);
    return [];
  }
}

function urlEntry({ loc, priority, lastmod }) {
  return [
    "  <url>",
    `    <loc>${SITE_URL}${loc}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    priority ? `    <priority>${priority}</priority>` : null,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

async function main() {
  const [articles, videos] = await Promise.all([
    fetchJson(`${API_BASE}/articles/published`),
    fetchJson(`${API_BASE}/diy-videos/published`),
  ]);

  const entries = [
    ...STATIC_ROUTES,
    ...articles.map((a) => ({
      loc: `/userarticle/${a.id}`,
      priority: "0.6",
      lastmod: a.updated_at?.slice(0, 10) || a.created_at?.slice(0, 10),
    })),
    ...videos.map((v) => ({
      loc: `/uservideo/${v.id}`,
      priority: "0.5",
      lastmod: v.updated_at?.slice(0, 10) || v.created_at?.slice(0, 10),
    })),
  ];

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries.map(urlEntry).join("\n") +
    `\n</urlset>\n`;

  const outPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "public",
    "sitemap.xml",
  );
  writeFileSync(outPath, xml);
  console.log(
    `[sitemap] Wrote ${entries.length} URLs (${articles.length} articles, ${videos.length} videos) to public/sitemap.xml`,
  );
}

main();
