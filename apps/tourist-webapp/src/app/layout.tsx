import "./globals.css";
import "@repo/ui/src/styles/globals.css";
import { Inter, Dancing_Script } from "next/font/google";
import { SessionProvider } from "@repo/auth";
import { InstallPrompt } from "@repo/ui";
import { BottomNav } from "@/components/BottomNav";
import { Navbar } from "@/components/navigation/Navbar";
import { RealtimeNotifications } from "@/components/providers/RealtimeNotifications";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-cursive",
  display: "swap",
});

export const metadata = {
  title: "Visit Uzbekistan — Discover the Heart of the Silk Road",
  description:
    "Explore Uzbekistan's ancient cities, hidden gems, and authentic local experiences. Plan your trip with verified guides, interactive maps, and AI-powered tools.",
  keywords:
    "uzbekistan tourism, visit uzbekistan, silk road, samarkand, bukhara, khiva, travel",
  openGraph: {
    title: "Visit Uzbekistan — Discover the Heart of the Silk Road",
    description:
      "Explore Uzbekistan's ancient cities, hidden gems, and authentic local experiences.",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#1877F2",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${dancingScript.variable}`}>
      <body className={`${inter.className} bg-white antialiased`}>
        <SessionProvider>
          <RealtimeNotifications />
          <Navbar />
          {/* Main content — full width, no constraints */}
          <main className="min-h-screen">{children}</main>
          {/* Mobile-only bottom navigation */}
          <div className="md:hidden">
            <BottomNav />
          </div>
          <InstallPrompt />
        </SessionProvider>
      </body>
    </html>
  );
}
