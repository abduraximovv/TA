import "./globals.css";
import "@repo/ui/src/styles/globals.css";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import { SessionProvider } from "@repo/auth";
import { InstallPrompt } from "@repo/ui";
import { SidebarWrapper } from "@/components/SidebarWrapper";

const fontSans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const fontSerif = Playfair_Display({ subsets: ["latin"], variable: "--font-serif", display: "swap" });
const fontMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata = {
  title: "provider-app",
  description: "Uzbekistan Digital Tourism Ecosystem",
};

export const viewport = {
  themeColor: "#0A2320",
  viewportFit: "cover",
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
          <InstallPrompt />
        </SessionProvider>
      </body>
    </html>
  );
}
