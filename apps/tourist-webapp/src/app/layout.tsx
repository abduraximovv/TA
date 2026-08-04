import "@repo/ui/src/styles/globals.css";
import "./globals.css";
import { Inter } from "next/font/google";
import { SessionProvider } from "@repo/auth";
import { InstallPrompt } from "@repo/ui";
import { BottomNav } from "@/components/BottomNav";
import { FloatingWidgets } from "@/components/FloatingWidgets";
import { Navbar } from "@/components/navigation/Navbar";
import { RealtimeNotifications } from "@/components/providers/RealtimeNotifications";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

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
  themeColor: "#006B70",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body style={{ margin: 0, background: "#F9F8F5", fontFamily: "'Inter', sans-serif" }}>
        <SessionProvider>
          <RealtimeNotifications />
          <Navbar />
          {/* Main content — no top padding; hero handles its own spacing */}
          <main style={{ minHeight: "100vh" }}>{children}</main>
          {/* Mobile-only bottom navigation */}
          <div className="md:hidden">
            <BottomNav />
          </div>
          <InstallPrompt />
          <FloatingWidgets />
        </SessionProvider>
      </body>
    </html>
  );
}
