import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const html = readFileSync("index.html", "utf8");
const head = new DOMParser().parseFromString(html, "text/html").head;

describe("homepage preferred URL", () => {
  it("declares the active Katimoja origin for crawlers", () => {
    expect(head.querySelector('link[rel="canonical"]')?.getAttribute("href"))
      .toBe("https://www.katimoja.africa/");
    expect(head.querySelector('meta[property="og:url"]')?.getAttribute("content"))
      .toBe("https://www.katimoja.africa/");
    expect(html).not.toContain("https://wematech.africa");
  });
});