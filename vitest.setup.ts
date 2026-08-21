import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// jsdom doesn't implement scrollIntoView (https://github.com/jsdom/jsdom/issues/1695).
// Components that call it (e.g. the search palette keeping the active option
// visible) would otherwise throw "scrollIntoView is not a function" in every
// test that renders them, regardless of whether that test cares about
// scrolling. Individual tests may still override this on
// Element.prototype to assert it was called.
if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

// vitest.config.ts sets `globals: false`, so React Testing Library's built-in
// auto-cleanup (which checks for a *global* `afterEach`) never registers.
// Without this, DOM from one `it()` leaks into the next within the same file,
// breaking any test that queries via `screen` (document.body) across
// multiple renders — see components/ui/button.test.tsx.
afterEach(() => {
  cleanup();
});
