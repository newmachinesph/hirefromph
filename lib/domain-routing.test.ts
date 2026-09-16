// @vitest-environment node
import { describe, expect, it } from "vitest";
import { unstable_getResponseFromNextConfig } from "next/experimental/testing/server";
import nextConfig from "../next.config";

function request(host: string, path = "/") {
  return unstable_getResponseFromNextConfig({
    url: `https://${host}${path}`,
    headers: { host },
    nextConfig,
  });
}

describe("learning domain migration", () => {
  it.each(["hirefrom.ph", "www.hirefrom.ph"])("permanently moves deep links on %s, preserving queries", async (host) => {
    for (const path of ["/start", "/insights/beyond-the-call-center-human-intelligence-outsourcing", "/educators/kit/session/ask-well", "/kit/decks/master.pdf"]) {
      const response = await request(host, `${path}?utm_source=old&tag=one`);
      expect(response.status).toBe(308);
      expect(response.headers.get("location")).toBe(`https://learn.hirefrom.ph${path}?utm_source=old&tag=one`);
    }
  });

  it("serves an indexable coming-soon homepage on the apex", async () => {
    const response = await request("hirefrom.ph", "/?utm_source=bookmark");
    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-rewrite")).toBe("https://hirefrom.ph/coming-soon/index.html?utm_source=bookmark");
    expect(response.headers.has("x-robots-tag")).toBe(false);
  });

  it("canonicalizes only the www homepage to the apex", async () => {
    const response = await request("www.hirefrom.ph");
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://hirefrom.ph/");
  });

  it.each(["learn.hirefrom.ph", "localhost:3000", "hirefromph-preview.vercel.app", "hirefromXph"])("does not redirect or rewrite learning pages on %s", async (host) => {
    for (const path of ["/", "/start", "/insights/example", "/robots.txt", "/sitemap.xml", "/sw.js"]) {
      const response = await request(host, path);
      expect(response.status).toBe(200);
      expect(response.headers.has("location")).toBe(false);
      expect(response.headers.has("x-middleware-rewrite")).toBe(false);
    }
  });

  it.each([
    ["/robots.txt", "/coming-soon/robots.txt"],
    ["/sitemap.xml", "/coming-soon/sitemap.xml"],
    ["/sw.js", "/coming-soon/retire-sw.js"],
  ])("serves the apex-specific %s", async (path, destination) => {
    const response = await request("hirefrom.ph", path);
    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-rewrite")).toBe(`https://hirefrom.ph${destination}`);
  });

  it.each(["/_next/static/example.js", "/icon.svg", "/favicon.ico", "/coming-soon/styles.css", "/coming-soon/CabinetGrotesk-Extrabold.woff2"])("keeps required asset %s on the apex", async (path) => {
    const response = await request("hirefrom.ph", path);
    expect(response.status).toBe(200);
    expect(response.headers.has("location")).toBe(false);
    expect(response.headers.has("x-middleware-rewrite")).toBe(false);
  });

  it("keeps the direct HTML preview out of search results", async () => {
    const response = await request("localhost:3000", "/coming-soon/index.html");
    expect(response.status).toBe(200);
    expect(response.headers.get("x-robots-tag")).toBe("noindex");
  });
});
