import { Inter } from "next/font/google";
import localFont from "next/font/local";

/** Body and UI face. Variable font, one file. */
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/** Display face for headings, buttons, and the wordmark. */
export const cabinet = localFont({
  src: [
    { path: "../app/fonts/CabinetGrotesk-Medium.woff2", weight: "500", style: "normal" },
    { path: "../app/fonts/CabinetGrotesk-Bold.woff2", weight: "700", style: "normal" },
    { path: "../app/fonts/CabinetGrotesk-Extrabold.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-cabinet",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "Arial", "sans-serif"],
  adjustFontFallback: "Arial",
});
