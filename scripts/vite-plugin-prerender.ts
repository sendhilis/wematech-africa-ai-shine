import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build, type Plugin } from "vite";
import { PRERENDER_PATHS, PRERENDER_ROUTES, SITE_URL } from "../src/prerender-routes";
import { buildSitemapXml, injectPage, outputFileFor } from "./prerender-lib";

const CHILD_FLAG = "KATIMOJA_PRERENDER_CHILD";

/** Latest change date (YYYY-MM-DD) of the given files from version history, if available. */
function lastModified(root: string, files: string[]): string | undefined {
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cs", "--", ...files], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(out) ? out : undefined;
  } catch {
    return undefined;
  }
}

/**
 * After the normal client build: server-render every public route into its own
 * static HTML file, and generate sitemap.xml from the same route list.
 */
export function prerenderPlugin(): Plugin {
  let root = process.cwd();
  let outDir = "dist";
  let isBuild = false;
  let isSsr = false;
  let mode = "production";

  return {
    name: "katimoja-prerender",
    apply: "build",
    configResolved(config) {
      root = config.root;
      outDir = path.resolve(root, config.build.outDir);
      isBuild = config.command === "build";
      isSsr = Boolean(config.build.ssr);
      mode = config.mode;
    },
    async closeBundle() {
      if (!isBuild || isSsr || process.env[CHILD_FLAG]) return;

      const ssrOut = path.resolve(root, "node_modules/.katimoja-prerender");
      process.env[CHILD_FLAG] = "1";
      try {
        await build({
          root,
          mode,
          logLevel: "warn",
          build: {
            ssr: path.resolve(root, "src/entry-server.tsx"),
            outDir: ssrOut,
            emptyOutDir: true,
            rollupOptions: { output: { format: "esm", entryFileNames: "entry-server.mjs" } },
          },
          ssr: { noExternal: true },
        });
      } finally {
        delete process.env[CHILD_FLAG];
      }

      const { render } = (await import(pathToFileURL(path.join(ssrOut, "entry-server.mjs")).href)) as {
        render: (url: string) => Promise<{ html: string; head: string }>;
      };

      const template = readFileSync(path.join(outDir, "index.html"), "utf8");
      for (const route of PRERENDER_ROUTES) {
        const { html, head } = await render(route.path);
        if (!html.trim()) throw new Error(`Prerender produced empty HTML for ${route.path}`);
        const file = path.join(outDir, outputFileFor(route.path));
        mkdirSync(path.dirname(file), { recursive: true });
        writeFileSync(file, injectPage(template, html, head, PRERENDER_PATHS));
      }

      const sitemap = buildSitemapXml(
        PRERENDER_ROUTES.map((r) => ({
          loc: `${SITE_URL}${r.path}`,
          lastmod: lastModified(root, r.sources),
          priority: r.priority,
          changefreq: r.changefreq,
        })),
      );
      writeFileSync(path.join(outDir, "sitemap.xml"), sitemap);
      rmSync(ssrOut, { recursive: true, force: true });
      console.log(`[prerender] ${PRERENDER_ROUTES.length} pages + sitemap.xml written`);
    },
  };
}
