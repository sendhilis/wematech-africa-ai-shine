import { describe, expect, it } from "vitest";
import { NOINDEX_PATHS, PRERENDER_PATHS } from "@/prerender-routes";
import { buildSitemapXml, injectPage, outputFileFor } from "../../scripts/prerender-lib";

const template =
  '<html><head><title>Home</title><meta name="description" content="home"/>' +
  '<link rel="canonical" href="https://www.katimoja.africa/" data-rh="true" /></head><body><div id="root"></div></body></html>';

describe("prerendered public pages", () => {
  it("covers the 18 public pages and none of the private ones", () => {
    expect(PRERENDER_PATHS).toHaveLength(18);
    for (const p of ["/", "/solutions", "/about", "/contact", "/blog", "/microsaas", "/microsaas/launchkit"]) {
      expect(PRERENDER_PATHS).toContain(p);
    }
    expect(PRERENDER_PATHS.filter((p) => p.startsWith("/blog/"))).toHaveLength(7);
    for (const p of NOINDEX_PATHS) expect(PRERENDER_PATHS).not.toContain(p);
  });

  it("gives each page its own title and canonical instead of the homepage's", () => {
    const out = injectPage(
      template,
      "<h1>About</h1>",
      '<title data-rh="true">About</title><link data-rh="true" rel="canonical" href="https://www.katimoja.africa/about"/>',
      ["/about"],
    );
    expect(out.match(/<title/g)).toHaveLength(1);
    expect(out).toContain("<title data-rh=\"true\">About</title>");
    expect(out).not.toContain('href="https://www.katimoja.africa/"');
    expect(out).toContain('<meta property="og:url" content="https://www.katimoja.africa/about"/>');
    expect(out).toContain('<div id="root"><h1>About</h1></div>');
  });

  it("writes nested pages to their own folder", () => {
    expect(outputFileFor("/")).toBe("index.html");
    expect(outputFileFor("/blog/digital-lending-africa")).toBe("blog/digital-lending-africa/index.html");
  });

  it("omits lastmod only when no real date is known", () => {
    const xml = buildSitemapXml([
      { loc: "https://www.katimoja.africa/a", lastmod: "2026-10-30", priority: "0.8", changefreq: "monthly" },
      { loc: "https://www.katimoja.africa/b", priority: "0.8", changefreq: "monthly" },
    ]);
    expect(xml).toContain("<loc>https://www.katimoja.africa/a</loc><lastmod>2026-10-30</lastmod>");
    expect(xml).toContain("<loc>https://www.katimoja.africa/b</loc><priority>");
  });
});
