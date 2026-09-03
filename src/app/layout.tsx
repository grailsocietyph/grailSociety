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
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
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
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
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