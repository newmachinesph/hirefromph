import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { BASE_URL } from "./sitemap";
import { inter } from "@/lib/fonts";
import { PathProvider } from "@/lib/path-context";
import { CONSENT_SCRIPT, GA_ID } from "@/lib/consent";
import {
  BackToTop,
  CookieNotice,
  MotionProvider,
  SiteFooter,
  SiteHeader,
  SWRegister,
} from "@/components/site";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "HireFromPH — Be the reason they hire from the Philippines.",
    template: "%s · HireFromPH",
  },
  description:
    "Free, open learning for Filipino online professionals: eleven ordered steps, twenty-two niches, and a source under every number.",
  applicationName: "HireFromPH",
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
    title: "HireFromPH — Build the online career you keep.",
    description:
      "Free, open learning for Filipino online professionals. Eleven ordered steps, and a link to the source under every number.",
    url: BASE_URL,
    siteName: "HireFromPH",
    locale: "en_PH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HireFromPH — Build the online career you keep.",
    description:
      "Free, open learning for Filipino online professionals. Eleven ordered steps, and a link to the source under every number.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#043882",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${BASE_URL}/#org`,
      name: "HireFromPH",
      url: BASE_URL,
      description:
        "An open, anonymous, non-commercial learning platform that helps Filipinos build an independent online career.",
      logo: `${BASE_URL}/icon.svg`,
    },
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: BASE_URL,
      name: "HireFromPH",
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
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <script dangerouslySetInnerHTML={{ __html: CONSENT_SCRIPT }} />
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
        <CookieNotice />
      </body>
      <GoogleAnalytics gaId={GA_ID} />
    </html>
  );
}
