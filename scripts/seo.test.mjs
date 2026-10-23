// Sitemap ↔ routes ↔ canonical ↔ robots.txt consistency.
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildEntries, toXml, STATIC_ROUTES, SITE_URL } from "./sitemap-lib.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(path.join(root, p), "utf8");
const app = read("src/App.jsx");
const robots = read("public/robots.txt");

const routePaths = [...app.matchAll(/path="([^"]+)"/g)].map((m) => m[1]);
const matchesRoute = (loc) =>
  routePaths.some((r) => new RegExp(`^${r.replace(/:[^/]+/g, "[^/]+")}$`).test(loc));

// Google's rule: the longest matching Allow/Disallow wins.
function blockedByRobots(loc) {
  const rules = [...robots.matchAll(/^(Allow|Disallow):\s*(\S+)/gm)].map(([, kind, p]) => ({ kind, p }));
  const hits = rules.filter((r) => loc.startsWith(r.p)).sort((a, b) => b.p.length - a.p.length);
  return hits[0]?.kind === "Disallow";
}

const articles = [
  { slug: "fix-a-slow-laptop", status: "published", updated_at: "2026-10-01T09:00:00Z" },
  { slug: "draft-post", status: "draft" },
  { id: 9, title: "no slug" },
];
const videos = [{ slug: "clean-your-fan", created_at: "2026-09-02 10:00:00" }];

describe("sitemap", () => {
  const entries = buildEntries(articles, videos);
  const locs = entries.map((e) => e.loc);

  it("lists content by slug (matching the routes and canonical tags), never by id", () => {
    expect(locs).toContain("/userarticle/fix-a-slow-laptop");
    expect(locs).toContain("/uservideo/clean-your-fan");
    expect(locs.some((l) => /\/user(article|video)\/\d+$/.test(l))).toBe(false);
  });

  it("leaves out drafts and items without a slug", () => {
    expect(locs).not.toContain("/userarticle/draft-post");
    expect(entries).toHaveLength(STATIC_ROUTES.length + 2);
  });

  it("every URL is a real route and isn't blocked by robots.txt", () => {
    for (const loc of locs) {
      expect(matchesRoute(loc), loc).toBe(true);
      expect(blockedByRobots(loc), loc).toBe(false);
    }
  });

  it("writes valid absolute URLs with ISO dates", () => {
    const xml = toXml(entries);
    expect(xml).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>/);
    expect(xml).toContain(`<loc>${SITE_URL}/userarticle/fix-a-slow-laptop</loc>`);
    expect(xml).toContain("<lastmod>2026-10-01</lastmod>");
    expect(xml).toContain("<lastmod>2026-09-02</lastmod>");
    expect(xml).not.toMatch(/<loc>\//);
  });

  it("escapes and encodes odd slugs", () => {
    const xml = toXml(buildEntries([{ slug: "a&b" }], []));
    expect(xml).toContain("/userarticle/a%26b");
  });
});

describe("canonical tags", () => {
  const pages = readdirSync(path.join(root, "src/components")).filter((f) => f.endsWith(".jsx"));
  const seoPaths = pages.flatMap((f) =>
    [...read(`src/components/${f}`).matchAll(/<SEO[\s\S]*?path=\{?["`]([^"`]+)["`]/g)].map((m) => [f, m[1]]),
  );

  it("every static sitemap page sets a canonical path equal to its URL", () => {
    const canonical = new Set(seoPaths.map(([, p]) => p));
    for (const { loc } of STATIC_ROUTES) expect(canonical.has(loc), loc).toBe(true);
  });

  it("article and video canonicals use the same slug paths as the sitemap", () => {
    const dynamic = seoPaths.map(([, p]) => p).filter((p) => p.includes("${"));
    expect(dynamic).toEqual(expect.arrayContaining(["/userarticle/${article.slug}", "/uservideo/${video.slug}"]));
  });

  it("canonical paths have no trailing slash (except the home page) and are real routes", () => {
    for (const [file, p] of seoPaths) {
      if (p === "/") continue;
      expect(p.endsWith("/"), `${file}: ${p}`).toBe(false);
      if (!p.includes("${")) expect(matchesRoute(p), `${file}: ${p}`).toBe(true);
    }
  });

  it("robots.txt points at the sitemap on the canonical domain", () => {
    expect(robots).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
  });
});
