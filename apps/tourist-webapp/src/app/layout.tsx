import "./globals.css";
import "@repo/ui/src/styles/globals.css";
import { Inter } from "next/font/google";
import { SessionProvider } from "@repo/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "tourist-webapp",
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
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
