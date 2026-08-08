import "./globals.css";
import "@repo/ui/src/styles/globals.css";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import { SessionProvider } from "@repo/auth";
import { InstallPrompt } from "@repo/ui";
import { SidebarWrapper } from "@/components/SidebarWrapper";

const fontSans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const fontSerif = Playfair_Display({ subsets: ["latin"], variable: "--font-serif", display: "swap" });
const fontMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

const SITE_URL = "https://providers.safron.uz";
const TITLE = "Safron Provider Portal — List Your Services & Manage Bookings";
const DESCRIPTION =
  "Become a verified Safron provider. List your tours, stays, and experiences, manage bookings in real time, and get discovered by travelers exploring Uzbekistan.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | Safron Provider Portal",
  },
  description: DESCRIPTION,
  keywords: [
    "Safron provider",
    "become a tour guide Uzbekistan",
    "list tours Uzbekistan",
    "Uzbekistan local guide platform",
    "Safron for providers",
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
    siteName: "Safron Provider Portal",
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
