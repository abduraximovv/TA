import "./globals.css";
import "@repo/ui/src/styles/globals.css";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";

import { SessionProvider } from "@repo/auth";
import { SidebarWrapper } from "@/components/SidebarWrapper";

const fontSans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const fontSerif = Playfair_Display({ subsets: ["latin"], variable: "--font-serif", display: "swap" });
const fontMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

const SITE_URL = "https://agencies.safron.uz";
const TITLE = "Safron Agency Portal — Manage Packages & Bookings in One Place";
const DESCRIPTION =
  "The operating system for Uzbekistan's travel agencies and DMCs. Build multi-day packages, track bookings in real time, and register free on Safron.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | Safron Agency Portal",
  },
  description: DESCRIPTION,
  keywords: [
    "Safron agency portal",
    "Uzbekistan travel agency software",
    "DMC booking software Uzbekistan",
    "travel agency management platform",
    "Safron for agencies",
  ],
  authors: [{ name: "Safron" }],
  creator: "Safron",
  publisher: "Safron",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Safron Agency Portal",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable}`}>
      <body className="font-sans bg-[#F9F8F5] text-[#0A2320] antialiased m-0">
        <SessionProvider>
          <SidebarWrapper>{children}</SidebarWrapper>
        </SessionProvider>
      </body>
    </html>
  );
}
