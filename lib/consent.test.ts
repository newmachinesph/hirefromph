import { beforeEach, describe, expect, it } from "vitest";
import { CONSENT_COOKIE, CONSENT_SCRIPT, GA_ID } from "@/lib/consent";

beforeEach(() => {
  document.cookie = `${CONSENT_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  delete window.dataLayer;
  delete window.gtag;
});

/** Run the inline script the way the browser would, then find its consent default. */
function runScript() {
  new Function(CONSENT_SCRIPT)();
  const calls = (window.dataLayer ?? []).map((entry) => Array.from(entry as ArrayLike<unknown>));
  return calls.find((args) => args[0] === "consent" && args[1] === "default");
}

describe("CONSENT_SCRIPT", () => {
  it("hard-codes the live GA property", () => {
    expect(GA_ID).toBe("G-41TT5P31BY");
  });

  it("defaults analytics to granted when nobody has declined", () => {
    const call = runScript();
    expect(call?.[2]).toMatchObject({ analytics_storage: "granted", ad_storage: "denied" });
  });

  it("replays a remembered Decline before gtag runs", () => {
    document.cookie = `${CONSENT_COOKIE}=false`;
    const call = runScript();
    expect(call?.[2]).toMatchObject({ analytics_storage: "denied" });
  });

  it("is safe to inline", () => {
    expect(CONSENT_SCRIPT).not.toContain("</script");
  });
});
