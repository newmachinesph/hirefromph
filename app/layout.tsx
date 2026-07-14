import type { Metadata } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { BASE_URL } from "./sitemap";
import site from "@/data/site.json";
import { PathProvider } from "@/lib/path-context";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FollowModal } from "@/components/follow-modal";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "DevUp, Developing Upwards. Build Your Online Career, Free.",
    template: "%s · DevUp",
  },
  description:
    "Free, no-catch learning for Filipino online professionals. Real talk on remote work, AI, direct clients, pay, and the skills that make you layoff-proof. We teach you to build it yourself, so you own it.",
  applicationName: "DevUp",
  keywords: [
    "online jobs Philippines",
    "online career Philippines",
    "remote professional Philippines",
    "freelancing Philippines",
    "AI skills Philippines",
    "how to get direct clients",
    "free online courses Philippines",
    "work from home Philippines",
    "salary guide Philippines 2027",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "DevUp, Build the online career you actually own. Free.",
    description:
      "Free learning for Filipino online professionals. Real talk on AI, direct clients, pay, taxes, and becoming layoff-proof. No catch.",
    url: BASE_URL,
    siteName: "DevUp",
    locale: "en_PH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevUp, Build the online career you actually own. Free.",
    description:
      "Free learning for Filipino online professionals. Real talk on AI, direct clients, pay, and becoming layoff-proof. No catch.",
  },
  robots: { index: true, follow: true },
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
        "A free, anonymous, non-commercial learning platform that helps Filipinos build an independent online career.",
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
        "Free learning for Filipino online professionals: AI, remote work, direct clients, pay, and the skills that make you layoff-proof.",
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
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <PathProvider>
          <SiteHeader />
          <main className="relative z-[2] flex-1">{children}</main>
          <SiteFooter />
          <FollowModal />
        </PathProvider>
      </body>
      <GoogleAnalytics gaId="G-TYFCQVVHK6" />
    </html>
  );
}
