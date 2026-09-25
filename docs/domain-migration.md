# Move learning to learn.hirefrom.ph

> **Current state (25 September 2026):** The jobs app now serves `hirefrom.ph`
> from the `hirefrom-beta` Vercel project. This learning project serves only
> `learn.hirefrom.ph`. The jobs app owns redirects from old apex learning paths
> to Learn. The coming-soon page and apex host rules below describe the earlier
> release and are kept as historical deployment notes.

This repository serves both sites from one Vercel project. No changes are needed
in `hirefromphjobs-frontend` for this release.

| Request | Result |
| --- | --- |
| `https://hirefrom.ph/` | 200: coming-soon page |
| `https://www.hirefrom.ph/` | 308 to `https://hirefrom.ph/` |
| `https://hirefrom.ph/start?ref=old` | 308 to `https://learn.hirefrom.ph/start?ref=old` |
| `https://www.hirefrom.ph/insights/<slug>` | 308 directly to the same path on Learn |
| `https://learn.hirefrom.ph/` | Existing learning homepage |
| `https://learn.hirefrom.ph/<path>` | Existing learning page or normal 404 |

The main homepage is intentionally **not** redirected: it cannot both display
the coming-soon page and redirect to Learn. This is a content migration, with
the original homepage being repurposed, rather than a complete domain move.

## Vercel release

1. In the **existing learning project's Settings → Domains**, add
   `learn.hirefrom.ph` and connect it to the production environment. Keep
   `hirefrom.ph` and, if used, `www.hirefrom.ph` assigned to this same project.
2. Create the DNS record Vercel specifies for `learn` at your DNS provider and
   wait for valid DNS and TLS. Use the exact value shown by Vercel.
3. Ensure these domains **serve the project**, without a Vercel domain-level
   redirect between apex and Learn. These code-level rules choose by host/path.
   Remove an existing www-to-apex domain redirect if you want old www content
   URLs to reach Learn in one hop.
4. Deploy this commit only once the new hostname is ready.
5. Verify the live responses below. This local implementation does not change
   DNS, Vercel domain settings, or Search Console by itself.

## Search indexing

- Learning canonicals, Open Graph URLs, structured data and the learning sitemap
  now derive from `https://learn.hirefrom.ph` via `app/sitemap.ts`.
- The apex has its own canonical, robots file and one-page sitemap. Its robots
  file allows crawling old paths so Google can follow their redirects.
- Verify access to both hosts in Google Search Console (a verified domain
  property may cover both), submit `https://learn.hirefrom.ph/sitemap.xml`, and
  inspect representative old/new URLs. Submit the apex sitemap for its new page.
- Do not use a whole-site Change of Address for this partial move: the apex
  homepage remains an active site for a different purpose.
- Keep the old content redirects for at least a year, preferably indefinitely.
  A 308 is a permanent migration signal; recrawling and indexing take time and
  rankings are not guaranteed.

Google references:
[site moves](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes),
[permanent redirects](https://developers.google.com/search/docs/crawling-indexing/301-redirects).

## Verification and maintenance

- `npm run test:unit -- lib/domain-routing.test.ts` checks real Next.js route
  matching, status codes, queries, host isolation and local assets.
- `npm run build` checks the production app.
- Run `npm run start -- --port 3000`. Preview the landing page at
  `http://localhost:3000/coming-soon/index.html`; localhost `/` remains Learn.
- Use `curl.exe -I -H "Host: hirefrom.ph" http://localhost:3000/` for the apex,
  and repeat with `/start`, `/robots.txt`, `/sitemap.xml`, `/sw.js` and the
  `learn.hirefrom.ph` host. After deployment repeat against the public HTTPS URLs.
- The landing page is static HTML/CSS in `public/coming-soon/`, uses the existing
  licensed Cabinet font, and does not load the learning navigation or analytics.
- `/sw.js` on the apex serves a retirement worker that clears only `hfph-*`
  caches and unregisters itself. Learn retains the existing offline worker.
- Saved learning progress lives in browser storage and does not automatically
  transfer between origins. Existing downloaded learning materials still contain
  some old URLs; their content links remain usable through the permanent redirects.
- When launching the jobs app on the apex later, carry the old learning-path
  redirects into the project serving that domain. Keep Learn on this project.
  Review route collisions explicitly; do not discard these redirects during the
  domain reassignment.
