# Design Review: Hire From PH site audit

Reviewed against: `README.md` and `BUILD_GUIDE.md` (the project has no standalone `DESIGN_BRIEF.md`)

Philosophy: Signal system using Space Grotesk, Inter Tight, graphite, cool white, and electric indigo

Date: 2026-08-17

## Screenshots Captured

| Screenshot | Breakpoint | Description |
| --- | --- | --- |
| `screenshots/review-homepage-desktop-1280.png` | Desktop, 1280px wide | Full homepage and footer |
| `screenshots/review-homepage-reveal-untriggered-desktop-1280.png` | Desktop, 1280px wide | Visible-by-default full-page regression reference |
| `screenshots/review-homepage-desktop-1280-viewport.png` | Desktop, 1280×800 | Hero and primary navigation |
| `screenshots/review-homepage-tablet-768.png` | Tablet, 768px wide | Full responsive homepage |
| `screenshots/review-homepage-tablet-768-viewport.png` | Tablet, 768×1024 | Tablet hero and compact navigation |
| `screenshots/review-homepage-mobile-375-viewport.png` | Mobile, 375×812 | Mobile hero and header |
| `screenshots/review-homepage-mobile-menu-open-375.png` | Mobile, 375×812 | Open navigation menu |
| `screenshots/review-equipment-desktop-1280-viewport.png` | Desktop, 1280×800 | Equipment-page hero |
| `screenshots/review-equipment-sources-desktop-1280.png` | Desktop, 1280×1600 | Price caveat, source links, cards, and budget panel |

The browser timed out while painting the 21,368px mobile page as one bitmap. The exact mobile fold and open-menu states were captured instead. The desktop and tablet sets include full-page references.

## Summary

The visual system is distinct and consistent. The hero establishes the promise quickly, the indigo signal color carries meaning without taking over, and cards keep a large amount of material orderly. The audit found and fixed mobile header overflow, undersized header controls, missing navigation state, search-dialog keyboard gaps, and content that was invisible until an intersection observer ran.

The main design question left is editorial: the homepage asks people to scan a very long catalog before the closing action. That is not broken, but it is heavy on a phone and needs a product decision rather than a cosmetic patch.

## Must Fix

None remain in the audited desktop, tablet, mobile, menu, and search-dialog states.

## Should Fix

1. **Reduce homepage catalog weight:** The 22 niche cards and the large workshop grid make the tablet page unusually long. See `screenshots/review-homepage-tablet-768.png`. A good next pass would show a smaller starting set, add a filter, or let people expand each catalog. This was not changed because each option is part of the site's current information architecture.

2. **Tighten the mobile menu rhythm:** Two columns work at 375px, but multi-line labels such as “Become Indispensable” and “Portfolio Ladder” make a few rows uneven. See `screenshots/review-homepage-mobile-menu-open-375.png`. A one-column layout below 360px would be a safe small-screen fallback.

## Could Improve

1. **Use motion only for feedback:** `components/reveal.tsx:17` now keeps long-form content visible in server HTML. If motion returns, reserve it for state changes such as selecting a niche, saving a tracker row, or opening a panel. Those moments explain what changed; repeated scroll fades do not.

2. **Bring the evidence cue closer to estimates elsewhere:** The new source panel on `app/equipment/page.tsx:54` is clear and calm. Other pages with planning figures can reuse that pattern so caveats and source dates stay next to the number they qualify.

## Fixed During Review

- The logo tagline now hides below 400px, preventing the 375px header from clipping (`components/logo.tsx:73`).
- Search and menu controls are 44×44px touch targets (`components/search-palette.tsx`, `components/site-header.tsx:232`).
- The search dialog traps focus, supports Escape from the full dialog, returns focus to its trigger, and exposes the active listbox option (`components/search-palette.tsx:89`).
- Active navigation links expose `aria-current="page"` in desktop, expanded, and mobile navigation (`components/site-header.tsx:84`).
- Long-page content is visible by default without JavaScript or `IntersectionObserver` (`components/reveal.tsx:17`).

## What Works Well

The desktop hero has a strong first-read order: promise, explanation, action, proof, then the staircase graphic. Tablet and mobile reorganize it instead of merely shrinking it. Body copy stays readable, focus and action controls remain easy to find, and the light-only palette feels deliberate. The equipment caveat is especially good: it puts the limitation, date, source links, and low-end total in the same visual neighborhood, as shown in `screenshots/review-equipment-sources-desktop-1280.png`.
