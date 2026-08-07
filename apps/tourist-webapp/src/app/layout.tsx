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

export const metadata = {
  title: "Silk Road Uzbekistan — Official Tourism Platform",
  description:
    "Four thousand years of the Silk Road, one journey. Explore Uzbekistan's ancient cities, hidden gems, and authentic local experiences. Plan with verified local providers.",
  keywords:
    "uzbekistan tourism, visit uzbekistan, silk road, samarkand, bukhara, khiva, travel, official",
  openGraph: {
    title: "Silk Road Uzbekistan — Official Tourism Platform",
    description:
      "From the turquoise domes of Samarkand to the mountain trails of Chimgan — plan, translate, and book with verified local providers.",
    type: "website",
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
