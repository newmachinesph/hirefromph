import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// vitest.config.ts sets `globals: false`, so React Testing Library's built-in
// auto-cleanup (which checks for a *global* `afterEach`) never registers.
// Without this, DOM from one `it()` leaks into the next within the same file,
// breaking any test that queries via `screen` (document.body) across
// multiple renders — see components/ui/button.test.tsx.
afterEach(() => {
  cleanup();
});
