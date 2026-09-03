import type { Metadata } from "next";
import "./globals.css";
import { ProductProvider } from "@/context/ProductContext";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { AnnouncementProvider } from "@/context/AnnouncementContext";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://grailsocietyph.com"
  ),
  title: {
    default: "Grail Society",
    template: "%s | Grail Society",
  },
  description: "Grail items you don't have to hunt for",
  openGraph: {
    title: "Grail Society",
    description: "Grail items you don't have to hunt for",
    url: "https://grailsocietyph.com",
    siteName: "Grail Society",
    images: [
      {
        url: "/white-logo.png",
        width: 1536,
        height: 1024,
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
    images: ["/white-logo.png"],
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