import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { resetCookieConsentValue } from "react-cookie-consent";
import { CONSENT_COOKIE } from "@/lib/consent";
import { CookieNotice } from "@/components/site/cookie-consent";

const gtag = vi.fn();

beforeEach(() => {
  resetCookieConsentValue(CONSENT_COOKIE);
  gtag.mockClear();
  window.gtag = gtag;
});

describe("CookieNotice", () => {
  it("grants analytics consent on Accept and remembers it", async () => {
    const user = userEvent.setup();
    render(<CookieNotice />);

    expect(await screen.findByRole("region", { name: "Cookie notice" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Accept analytics cookies" }));

    expect(gtag).toHaveBeenCalledWith("consent", "update", { analytics_storage: "granted" });
    expect(screen.queryByRole("region", { name: "Cookie notice" })).not.toBeInTheDocument();
    expect(document.cookie).toContain(`${CONSENT_COOKIE}=true`);
  });

  it("denies analytics consent on Decline and remembers it", async () => {
    const user = userEvent.setup();
    render(<CookieNotice />);

    await screen.findByRole("region", { name: "Cookie notice" });
    await user.click(screen.getByRole("button", { name: "Decline analytics cookies" }));

    expect(gtag).toHaveBeenCalledWith("consent", "update", { analytics_storage: "denied" });
    expect(screen.queryByRole("region", { name: "Cookie notice" })).not.toBeInTheDocument();
    expect(document.cookie).toContain(`${CONSENT_COOKIE}=false`);
  });

  it("stays hidden for a visitor who already answered", async () => {
    document.cookie = `${CONSENT_COOKIE}=true`;
    render(<CookieNotice />);

    // The library decides visibility in componentDidMount; give it a tick.
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(screen.queryByRole("region", { name: "Cookie notice" })).not.toBeInTheDocument();
    expect(gtag).not.toHaveBeenCalled();
  });
});
