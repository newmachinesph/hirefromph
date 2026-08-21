import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { resetCookieConsentValue } from "react-cookie-consent";
import { CONSENT_COOKIE, CookieNotice } from "@/components/site/cookie-consent";

vi.mock("@next/third-parties/google", () => ({
  GoogleAnalytics: () => <div data-testid="ga" />,
}));

beforeEach(() => {
  resetCookieConsentValue(CONSENT_COOKIE);
});

describe("CookieNotice", () => {
  it("shows the notice and loads analytics only after Accept", async () => {
    const user = userEvent.setup();
    render(<CookieNotice />);

    expect(await screen.findByRole("region", { name: "Cookie notice" })).toBeInTheDocument();
    expect(screen.queryByTestId("ga")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Accept analytics cookies" }));

    expect(screen.getByTestId("ga")).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Cookie notice" })).not.toBeInTheDocument();
    expect(document.cookie).toContain(`${CONSENT_COOKIE}=true`);
  });

  it("remembers Decline and never loads analytics", async () => {
    const user = userEvent.setup();
    render(<CookieNotice />);

    await screen.findByRole("region", { name: "Cookie notice" });
    await user.click(screen.getByRole("button", { name: "Decline analytics cookies" }));

    expect(screen.queryByTestId("ga")).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Cookie notice" })).not.toBeInTheDocument();
    expect(document.cookie).toContain(`${CONSENT_COOKIE}=false`);
  });

  it("stays quiet and loads analytics for a visitor who already accepted", async () => {
    document.cookie = `${CONSENT_COOKIE}=true`;
    render(<CookieNotice />);

    expect(await screen.findByTestId("ga")).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Cookie notice" })).not.toBeInTheDocument();
  });
});
