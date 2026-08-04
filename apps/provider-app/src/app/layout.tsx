import "./globals.css";
import "@repo/ui/src/styles/globals.css";
import { Inter } from "next/font/google";
import { SessionProvider } from "@repo/auth";
import { InstallPrompt } from "@repo/ui";
import { SidebarWrapper } from "@/components/SidebarWrapper";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <SidebarWrapper>{children}</SidebarWrapper>
          <InstallPrompt />
        </SessionProvider>
      </body>
    </html>
  );
}
