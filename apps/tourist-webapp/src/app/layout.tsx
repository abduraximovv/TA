import "@repo/ui/src/styles/globals.css";
import "./globals.css";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "leaflet/dist/leaflet.css";
import { SessionProvider } from "@repo/auth";
import { InstallPrompt } from "@repo/ui";
import { BottomNav } from "@/components/BottomNav";
import { FloatingWidgets } from "@/components/FloatingWidgets";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/landing/Footer";
import { RealtimeNotifications } from "@/components/providers/RealtimeNotifications";

const fontSans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const fontSerif = Playfair_Display({ subsets: ["latin"], variable: "--font-serif", display: "swap" });
const fontMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

const SITE_URL = "https://safron.uz";
const TITLE = "Safron — Uzbekistan Travel Platform | Book Tours, Guides & Stays";
const DESCRIPTION =
  "Plan your Uzbekistan trip with Safron. Discover Samarkand, Bukhara, and Khiva, book verified local guides and experiences, and build multi-day itineraries — all in one place.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | Safron",
  },
  description: DESCRIPTION,
  keywords: [
    "Safron",
    "Uzbekistan tourism",
    "visit Uzbekistan",
    "Silk Road travel",
    "Samarkand tours",
    "Bukhara travel guide",
    "Khiva tourism",
    "Uzbekistan travel agency",
    "book local guide Uzbekistan",
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
    siteName: "Safron",
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

export const viewport = {
  themeColor: "#0A2320",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
          <RealtimeNotifications />
          <Navbar />
          {/* Main content — no top padding; hero handles its own spacing */}
          <main style={{ minHeight: "100vh" }}>{children}</main>
          {/* Mobile-only bottom navigation */}
          <div className="md:hidden">
            <BottomNav />
          </div>
          <Footer />
          <InstallPrompt />
          <FloatingWidgets />
        </SessionProvider>
      </body>
    </html>
  );
}
