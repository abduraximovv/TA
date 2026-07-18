import "./globals.css";
import "@repo/ui/src/styles/globals.css";
import { Inter } from "next/font/google";
import { SessionProvider } from "@repo/auth";
import { InstallPrompt } from "@repo/ui";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "provider-app",
  description: "Uzbekistan Digital Tourism Ecosystem",
};

export const viewport = {
  themeColor: "#1E6F8A",
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
          {children}
          <InstallPrompt />
        </SessionProvider>
      </body>
    </html>
  );
}
