import { Inter } from "next/font/google";

/**
 * One face for everything. Inter carries body, UI and every heading; weight
 * and size do the work a second typeface used to do. The static woff files
 * in `app/fonts/` exist only for `opengraph-image.tsx`, which renders in an
 * isolated pass that cannot read this loader.
 */
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
