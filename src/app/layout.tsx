import type { Metadata } from "next";
import "./globals.css";
import { ProductProvider } from "@/context/ProductContext";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { AnnouncementProvider } from "@/context/AnnouncementContext";

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://grailsocietyph.com";
const siteUrl = rawSiteUrl.startsWith("http://") || rawSiteUrl.startsWith("https://")
  ? rawSiteUrl
  : `https://${rawSiteUrl}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Grail Society",
    template: "%s | Grail Society",
  },
  description: "Grail items you don't have to hunt for",
  openGraph: {
    title: "Grail Society",
    description: "Grail items you don't have to hunt for",
    url: siteUrl,
    siteName: "Grail Society",
    images: [
      {
        url: "/GS_logo.jpg",
        secureUrl: `${siteUrl}/GS_logo.jpg`,
        width: 1512,
        height: 1512,
        type: "image/jpeg",
        alt: "Grail Society",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Grail Society",
    description: "Grail items you don't have to hunt for",
    images: ["/GS_logo.jpg"],
  },
  icons: {
    icon: [
      { url: "/GS_logo.jpg", type: "image/jpeg" },
    ],
    apple: [
      { url: "/GS_logo.jpg", type: "image/jpeg" },
    ],
    shortcut: "/GS_logo.jpg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-helvetica bg-white text-neutral-900 antialiased">
        <AdminAuthProvider>
          <AnnouncementProvider>
            <ProductProvider>
              {children}
            </ProductProvider>
          </AnnouncementProvider>
        </AdminAuthProvider>
      </body>
    </html>
  );
}