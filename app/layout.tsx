import type { Metadata } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { PathProvider } from "@/lib/path-context";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://devup.example.com"),
  title: {
    default: "DevUp — Developing Upwards. Build Your Online Career, Free.",
    template: "%s · DevUp",
  },
  description:
    "A free, path-based platform that takes Filipinos from zero to a thriving remote career as an online professional. Guides, in-app tools, AI prompts, and a directory of where to get hired — enterprise-grade, and free.",
  keywords: [
    "online career Philippines",
    "remote professional",
    "freelancing Philippines",
    "free learning portal",
    "get hired remote",
  ],
  openGraph: {
    title: "DevUp — Developing Upwards. Build Your Online Career, Free.",
    description:
      "Choose your path. Unlock guides, in-app tools, AI prompts, and a hiring directory built for Filipino online professionals.",
    type: "website",
  },
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
        <PathProvider>
          <SiteHeader />
          <main className="relative z-[2] flex-1">{children}</main>
          <SiteFooter />
        </PathProvider>
      </body>
    </html>
  );
}
