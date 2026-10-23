// Pure helpers for the sitemap, shared by generate-sitemap.mjs and its
// tests. Content URLs use the SLUG — the same path the routes
// (/userarticle/:slug, /uservideo/:slug) and each page's canonical tag
// use — so the sitemap, canonical and real URL always agree.
import { SITE_URL } from "../src/config/seo.js";

export { SITE_URL };

export const STATIC_ROUTES = [
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

export const articlePath = (slug) => `/userarticle/${encodeURIComponent(slug)}`;
export const videoPath = (slug) => `/uservideo/${encodeURIComponent(slug)}`;

const day = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10);
};

const isPublished = (item) => item && item.slug && (!item.status || item.status === "published");

export function buildEntries(articles = [], videos = []) {
  const entries = [
    ...STATIC_ROUTES,
    ...articles.filter(isPublished).map((a) => ({
      loc: articlePath(a.slug),
      priority: "0.6",
      lastmod: day(a.updated_at || a.created_at),
    })),
    ...videos.filter(isPublished).map((v) => ({
      loc: videoPath(v.slug),
      priority: "0.5",
      lastmod: day(v.updated_at || v.created_at),
    })),
  ];
  const seen = new Set();
  return entries.filter((e) => !seen.has(e.loc) && seen.add(e.loc));
}

const xmlEscape = (s) =>
  String(s).replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]);

export function toXml(entries) {
  const urls = entries.map(({ loc, priority, lastmod }) =>
    [
      "  <url>",
      `    <loc>${xmlEscape(SITE_URL + loc)}</loc>`,
      lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
      priority ? `    <priority>${priority}</priority>` : null,
      "  </url>",
    ]
      .filter(Boolean)
      .join("\n"),
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}
