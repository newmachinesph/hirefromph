import Link from "next/link";
import { Container } from "@/components/layout";
import { HeaderCta } from "./header-cta";
import { Logo } from "./logo";
import { MobileDrawer } from "./mobile-drawer";
import { NavDesktop } from "./nav-desktop";
import { SearchPalette } from "./search-palette";

/**
 * Floating white bar: opaque paper band, bordered pill, 72px, sticky.
 * No backdrop blur and no transparency (spec §6.1) — the border does the work.
 * Server component: only the three interactive children are client code.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-paper py-3">
      <Container>
        <div className="flex h-[72px] items-center justify-between gap-2 min-[400px]:gap-4 rounded-pill border border-line bg-paper px-2 min-[400px]:px-4 sm:px-6">
          <Link href="/" className="shrink-0 rounded-md" aria-label="Hire From PH, the standard, not the discount — home">
            <Logo markSize={30} showTagline />
          </Link>

          <NavDesktop />

          <div className="flex shrink-0 items-center gap-2">
            <SearchPalette />
            <HeaderCta />
            <MobileDrawer />
          </div>
        </div>
      </Container>
    </header>
  );
}
