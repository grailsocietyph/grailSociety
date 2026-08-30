import type { Metadata } from "next";
import "./globals.css";
import { ProductProvider } from "@/context/ProductContext";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { AnnouncementProvider } from "@/context/AnnouncementContext";

export const metadata: Metadata = {
  title: "Grail Society",
  description: "Grail items you don't have to hunt for",
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