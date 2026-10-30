/**
 * Single source of truth for public pages that are prerendered to static HTML
 * at build time and listed in the generated sitemap.xml.
 *
 * To add a new public page: add its route in src/App.tsx, then add an entry here.
 * `sources` are the project files whose last change date becomes the page's
 * sitemap <lastmod> (read from version history at build time).
 */
export const SITE_URL = "https://www.katimoja.africa";

export interface PrerenderRoute {
  path: string;
  sources: string[];
  priority: string;
  changefreq: "daily" | "weekly" | "monthly" | "yearly";
}

const product = (slug: string): PrerenderRoute => ({
  path: `/microsaas/${slug}`,
  sources: ["src/pages/MicroSaaSProductPage.tsx", "src/data/microsaas.ts"],
  priority: "0.8",
  changefreq: "monthly",
});

const post = (slug: string, file: string, priority = "0.9"): PrerenderRoute => ({
  path: `/blog/${slug}`,
  sources: [`src/pages/${file}.tsx`],
  priority,
  changefreq: "monthly",
});

export const PRERENDER_ROUTES: PrerenderRoute[] = [
  { path: "/", sources: ["src/pages/Index.tsx", "src/components/HeroSection.tsx"], priority: "1.0", changefreq: "weekly" },
  { path: "/solutions", sources: ["src/pages/Solutions.tsx"], priority: "0.9", changefreq: "weekly" },
  { path: "/about", sources: ["src/pages/About.tsx"], priority: "0.8", changefreq: "monthly" },
  { path: "/contact", sources: ["src/pages/Contact.tsx"], priority: "0.8", changefreq: "monthly" },
  { path: "/blog", sources: ["src/pages/Blog.tsx"], priority: "0.8", changefreq: "weekly" },
  post("best-banking-technology-vendor-africa-2026", "BlogPost_BestBankingTechnologyVendorAfrica2026"),
  post("banking-technology-nigeria", "BlogPost_BankingTechnologyNigeria"),
  post("banking-technology-kenya", "BlogPost_BankingTechnologyKenya"),
  post("banking-technology-south-africa", "BlogPost_BankingTechnologySouthAfrica"),
  post("digital-lending-africa", "BlogPost_DigitalLendingAfrica"),
  post("ai-transforming-core-banking-nigeria", "BlogPost_AICoreBankingNigeria", "0.7"),
  post("mobile-money-financial-inclusion-kenya", "BlogPost_MobileMoneyKenya", "0.7"),
  { path: "/microsaas", sources: ["src/pages/MicroSaaSCatalogue.tsx", "src/data/microsaas.ts"], priority: "0.8", changefreq: "monthly" },
  product("bankbot"),
  product("scoreai"),
  product("sme-pulse"),
  product("compliance-alert"),
  product("launchkit"),
];

export const PRERENDER_PATHS = PRERENDER_ROUTES.map((r) => r.path);

/** Private pages: rendered only in the browser and marked noindex. */
export const NOINDEX_PATHS = ["/admin", "/admin/login", "/admin/seo-warroom", "/auth", "/microsaas/compliance-alert/app"];
