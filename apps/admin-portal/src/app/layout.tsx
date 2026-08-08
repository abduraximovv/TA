import "./globals.css";
import "@repo/ui/src/styles/globals.css";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";

import { SessionProvider } from "@repo/auth";
import { SidebarWrapper } from "@/components/SidebarWrapper";

const fontSans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const fontSerif = Playfair_Display({ subsets: ["latin"], variable: "--font-serif", display: "swap" });
const fontMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

const SITE_URL = "https://admin.safron.uz";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Safron Admin",
    template: "%s | Safron Admin",
  },
  description: "Internal administration console for the Safron platform.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
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
          <SidebarWrapper>
            {children}
          </SidebarWrapper>
        </SessionProvider>
      </body>
    </html>
  );
}
