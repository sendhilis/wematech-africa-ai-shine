/** Pure helpers for build-time prerendering and sitemap generation (unit-tested). */

export interface SitemapEntry {
  loc: string;
  lastmod?: string;
  priority: string;
  changefreq: string;
}

export function buildSitemapXml(entries: SitemapEntry[]): string {
  const rows = entries.map((e) => {
    const lastmod = e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : "";
    return `  <url><loc>${e.loc}</loc>${lastmod}<priority>${e.priority}</priority><changefreq>${e.changefreq}</changefreq></url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join("\n")}\n</urlset>\n`;
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Puts a page's rendered body and its own head tags into the built index.html.
 * Default head tags that the page overrides (title, description, canonical, og:*, twitter:*)
 * are removed so each page carries exactly one of each.
 */
export function injectPage(template: string, appHtml: string, head: string, prerenderedPaths: string[]): string {
  let out = template;

  if (/<title[\s>]/.test(head)) out = out.replace(/<title>[\s\S]*?<\/title>/, "");
  for (const m of head.matchAll(/<meta[^>]*\s(name|property)="([^"]+)"/g)) {
    out = out.replace(new RegExp(`\\s*<meta[^>]*\\s${m[1]}="${escapeRe(m[2])}"[^>]*>`, "g"), "");
  }
  if (/<link[^>]*rel="canonical"/.test(head)) {
    out = out.replace(/\s*<link[^>]*rel="canonical"[^>]*>/g, "");
  }
  out = out.replace("</head>", `${head}\n  </head>`);

  // If the host serves this file for a page that was not prerendered (404s, private pages),
  // clear the prerendered body before the app starts so it renders the right page.
  const guard =
    `<script>(function(){var p=location.pathname.replace(/\\/+$/,"")||"/";` +
    `if(${JSON.stringify(prerenderedPaths)}.indexOf(p)<0){var r=document.getElementById("root");if(r)r.innerHTML="";}})();</script>`;
  out = out.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>${guard}`);
  return out;
}

export function outputFileFor(path: string): string {
  return path === "/" ? "index.html" : `${path.replace(/^\//, "")}/index.html`;
}
