import homeData from "@/data/home.json";
import siteData from "@/data/site.json";

/** A labelled destination. Same shape as PageFooterNav's FooterLink. */
export type HomeLink = { label: string; href: string };
export type HomeFeature = { icon: string; title: string; body: string };
export type HomeSection = { kicker: string; title: string; lead: string };

export type HomeCopy = {
  hero: {
    kicker: string;
    /** Headline, minus the coloured trailing segment. */
    title: string;
    /** Trailing segment, coloured primary by `Heading accent`. */
    accent: string;
    lead: string;
    primary: HomeLink;
    secondary: HomeLink;
    honesty: string;
    honestyLink: HomeLink;
  };
  howItWorks: HomeSection & { items: HomeFeature[] };
  path: HomeSection & { action: HomeLink };
  lane: HomeSection & { more: HomeLink };
  build: HomeSection & { action: HomeLink; items: { href: string; icon: string }[] };
  standard: { action: HomeLink };
  /** `links` is keyed by `data/faq.json` item id. */
  questions: HomeSection & { links: Record<string, string> };
  cta: { title: string; body: string; action: HomeLink };
};

export const HOME: HomeCopy = homeData;

/**
 * The four structural facts in the hero strip (spec §8.1.1, §6.5). These are
 * counts of what the site contains, never achievements — and lib/home.test.ts
 * asserts each value against the data file it counts.
 */
export type HomeStat = { value: string; label: string; sub: string };
export const HOME_STATS: HomeStat[] = siteData.stats;
