import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter_Tight, Space_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { BASE_URL } from "./sitemap";
import site from "@/data/site.json";
import { PathProvider } from "@/lib/path-context";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FollowModal } from "@/components/follow-modal";
import { MotionProvider } from "@/components/motion-provider";
import { SWRegister } from "@/components/sw-register";
import { BackToTop } from "@/components/back-to-top";

const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"], display: "swap" });
const interTight = Inter_Tight({ variable: "--font-inter-tight", subsets: ["latin"], display: "swap" });
const spaceMono = Space_Mono({ variable: "--font-space-mono", subsets: ["latin"], weight: ["400", "700"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "DevUp, Developing Upwards. Build Your Online Career.",
    template: "%s · DevUp",
  },
  description:
    "Open learning for Filipino online professionals. Real talk on remote work, AI, direct clients, pay, and the skills that make you layoff-proof. We teach you to build it yourself, so you own it.",
  applicationName: "DevUp",
  keywords: [
    "online jobs Philippines",
    "online career Philippines",
    "remote professional Philippines",
    "freelancing Philippines",
    "AI skills Philippines",
    "how to get direct clients",
    "online career courses Philippines",
    "work from home Philippines",
    "salary guide Philippines",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "DevUp, Build the online career you actually own.",
    description:
      "Open learning for Filipino online professionals. Real talk on AI, direct clients, pay, taxes, and becoming layoff-proof.",
    url: BASE_URL,
    siteName: "DevUp",
    locale: "en_PH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevUp, Build the online career you actually own.",
    description:
      "Open learning for Filipino online professionals. Real talk on AI, direct clients, pay, and becoming layoff-proof.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0d9488",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${BASE_URL}/#org`,
      name: "DevUp",
      url: BASE_URL,
      description:
        "An open, anonymous, non-commercial learning platform that helps Filipinos build an independent online career.",
      logo: `${BASE_URL}/icon.svg`,
      sameAs: [site.social.facebook],
    },
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: BASE_URL,
      name: "DevUp",
      inLanguage: "en-PH",
      description:
        "Open learning for Filipino online professionals: AI, remote work, direct clients, pay, and the skills that make you layoff-proof.",
      publisher: { "@id": `${BASE_URL}/#org` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${interTight.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <PathProvider>
          <MotionProvider>
            <SiteHeader />
            <main className="relative z-[2] flex-1">{children}</main>
            <SiteFooter />
            <FollowModal />
            <BackToTop />
          </MotionProvider>
        </PathProvider>
        <SWRegister />
      </body>
      <GoogleAnalytics gaId="G-TYFCQVVHK6" />
    </html>
  );
}
