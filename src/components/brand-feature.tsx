"use client";

import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";

export default function BrandFeature() {
  return (
    <section className="mx-auto max-w-360 px-4 sm:px-8 py-12 lg:py-16 font-helvetica">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
        
        {/* Left Side: Brand Image */}
        <div className="relative aspect-square w-full overflow-hidden bg-neutral-100 rounded-none">
          <Image
            src="/brand-image.jpg"
            alt="Grail Society Collection"
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center"
          />
        </div>

        {/* Right Side: Statement Text, Socials & Card for Location Details */}
        <div className="flex flex-col items-start justify-center max-w-md">
          <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-black tracking-tight mb-2">
            Grail Society
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-6 font-normal">
            grail items you don&apos;t have to hunt for
          </p>

          {/* Social Links Row (Outside the card) */}
          <div className="w-full flex items-center space-x-3 mb-6">
            <a
              href="mailto:grailsociety.ph@gmail.com"
              aria-label="Email"
              className="p-2.5 rounded-full bg-neutral-100 text-neutral-900 hover:bg-black hover:text-white transition-all cursor-pointer flex items-center justify-center"
            >
              <Mail className="h-4 w-4" />
            </a>

            <a
              href="https://www.facebook.com/people/Grail-Society/100075987014852/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="p-2.5 rounded-full bg-neutral-100 text-neutral-900 hover:bg-black hover:text-white transition-all cursor-pointer flex items-center justify-center"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>

            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="p-2.5 rounded-full bg-neutral-100 text-neutral-900 hover:bg-black hover:text-white transition-all cursor-pointer flex items-center justify-center"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          </div>

          {/* Location Details Card Container (With soft background color and minimalist border) */}
          <div className="w-full bg-neutral-50/70 border border-neutral-200/80 p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400">
              <MapPin className="h-3.5 w-3.5" />
              <span>Location Details</span>
            </div>
            
            <div className="space-y-1.5 text-sm text-neutral-800">
              <p className="font-bold text-neutral-900 uppercase tracking-wide text-base">EC Carwash</p>
              <p className="font-medium">Purok 3, Brgy. Bambang, Nagcarlan, Laguna</p>
              <p className="text-neutral-500 font-normal">(Gray Apartment)</p>
              <div className="flex items-center gap-2 pt-1 text-neutral-900 font-bold">
                <Phone className="h-4 w-4" />
                <span>09762183355</span>
              </div>
            </div>

            {/* Store Location Button */}
            <div className="pt-1">
              <a
                href="https://maps.google.com/?q=EC+Carwash+Bambang+Nagcarlan+Laguna"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-black text-white text-xs font-medium rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <MapPin className="h-4 w-4" />
                <span>Store Location</span>
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}