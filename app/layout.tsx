import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { BASE_URL } from "./sitemap";
import { inter, cabinet } from "@/lib/fonts";
import { PathProvider } from "@/lib/path-context";
import {
  BackToTop,
  MotionProvider,
  SiteFooter,
  SiteHeader,
  SWRegister,
} from "@/components/site";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Hire From PH — Be the reason they hire from the Philippines.",
    template: "%s · Hire From PH",
  },
  description:
    "Open learning for Filipino online professionals. Real talk on remote work, AI, direct clients, pay, and the skills that make you layoff-proof. We teach you to build it yourself, so you own it.",
  applicationName: "Hire From PH",
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
    title: "Hire From PH — Build the online career you actually own.",
    description:
      "Open learning for Filipino online professionals. Real talk on AI, direct clients, pay, taxes, and becoming layoff-proof.",
    url: BASE_URL,
    siteName: "Hire From PH",
    locale: "en_PH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hire From PH — Build the online career you actually own.",
    description:
      "Open learning for Filipino online professionals. Real talk on AI, direct clients, pay, and becoming layoff-proof.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#4B4EF6",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${BASE_URL}/#org`,
      name: "Hire From PH",
      url: BASE_URL,
      description:
        "An open, anonymous, non-commercial learning platform that helps Filipinos build an independent online career.",
      logo: `${BASE_URL}/icon.svg`,
    },
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: BASE_URL,
      name: "Hire From PH",
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
      className={`${inter.variable} ${cabinet.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <PathProvider>
          <MotionProvider>
            <SiteHeader />
            <main id="main" tabIndex={-1} className="relative z-[2] flex-1 outline-none">{children}</main>
            <SiteFooter />
            <BackToTop />
          </MotionProvider>
        </PathProvider>
        <SWRegister />
      </body>
      <GoogleAnalytics gaId="G-41TT5P31BY" />
    </html>
  );
}
