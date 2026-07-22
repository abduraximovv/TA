import "./globals.css";
import "@repo/ui/src/styles/globals.css";
import { Inter } from "next/font/google";

import { SessionProvider } from "@repo/auth";
import { SidebarWrapper } from "@/components/SidebarWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "admin-portal",
  description: "Uzbekistan Digital Tourism Ecosystem",
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
          <SidebarWrapper>
            {children}
          </SidebarWrapper>
        </SessionProvider>
      </body>
    </html>
  );
}
