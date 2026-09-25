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

describe("learning host routing", () => {
  it("retires the old coming-soon preview", async () => {
    const response = await request("learn.hirefrom.ph", "/coming-soon/index.html");
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://learn.hirefrom.ph/");
  });

  it.each(["learn.hirefrom.ph", "localhost:3000", "hirefromph-preview.vercel.app"])(
    "serves learning routes without host rewrites on %s",
    async (host) => {
      for (const path of ["/", "/start", "/insights/example", "/robots.txt", "/sitemap.xml", "/sw.js"]) {
        const response = await request(host, path);
        expect(response.status).toBe(200);
        expect(response.headers.has("location")).toBe(false);
        expect(response.headers.has("x-middleware-rewrite")).toBe(false);
      }
    },
  );
});
