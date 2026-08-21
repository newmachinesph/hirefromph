import Link from "next/link";
import { Container } from "@/components/layout";
import site from "@/data/site.json";
import { NAV, NAV_GROUPS, isLive, isMenu, type NavLink, type NavMenu } from "@/lib/nav";
import { Logo } from "./logo";

/** Shell copy. Phase 8 owns the final wording; the honesty rule does not move. */
const HONESTY =
  "Hire From PH is an independent, non-commercial project. Every page is free to read, and every figure carries its source.";

/** Not a copyright line: the owner asserts none, this just flags that the
 *  figures elsewhere on the page are cited estimates, not promises. */
const DATA_NOTE =
  "Pay figures and market data are cited to their sources. They are estimates, not promises.";

type FooterColumn = { title: string; links: NavLink[] };

/** Learn's navGroups bucket is 14-16 links deep — over double any other
 *  column. It splits back into the two sub-groups authored in `nav` ("Build
 *  skills", "Work like a professional", plus the Practice/Glossary
 *  footerLinks folded into the second) so the footer reads as five
 *  even-ish columns instead of one long one. */
const learnMenu = NAV.find((item): item is NavMenu => isMenu(item) && item.label === "Learn");

const FOOTER_COLUMNS: FooterColumn[] = NAV_GROUPS.flatMap((group): FooterColumn[] => {
  if (group.title !== "Learn" || !learnMenu) return [{ title: group.title, links: group.links }];

  const footerExtras = learnMenu.footerLinks ?? [];
  return learnMenu.groups.map((sub, index) => ({
    title: sub.title,
    links: index === learnMenu.groups.length - 1 ? [...sub.links, ...footerExtras] : sub.links,
  }));
});

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-band">
      <Container>
        <div className="grid gap-10 py-16 md:grid-cols-2 lg:grid-cols-[1.3fr_repeat(5,1fr)]">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex rounded-md" aria-label="Hire From PH — home">
              <Logo markSize={32} />
            </Link>
            <p className="mt-5 text-small leading-relaxed text-ink-soft">{site.meaning}</p>
            <p className="mt-4 text-caption leading-relaxed text-ink-faint">{HONESTY}</p>
          </div>

          <nav aria-label="Footer" className="contents">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title}>
                <h2 className="text-kicker uppercase text-ink-faint">{column.title}</h2>
                <ul className="mt-4 space-y-2.5">
                  {column.links.filter(isLive).map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-small text-ink-soft transition-colors duration-150 hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="border-t border-line py-8">
          <p className="text-caption text-ink-faint">
            {site.brand}. {DATA_NOTE}
          </p>
        </div>
      </Container>
    </footer>
  );
}
