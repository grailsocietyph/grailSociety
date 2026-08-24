"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUp, MapPin } from "lucide-react";

export default function Footer() {
  const [isHovered, setIsHovered] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-white border-t border-neutral-100 font-helvetica text-xs text-neutral-500">
      <div className="mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 h-auto sm:h-20 px-4 sm:px-8 py-6 sm:py-0 max-w-360">
        
        {/* Left: Copyright */}
        <div className="text-neutral-500">
          © 2026 Grail Society
        </div>

        {/* Center: Terms and Policies with Pop-up Dropdown */}
        <div 
          className="relative py-2"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <button className="text-neutral-600 hover:text-black transition-colors focus:outline-none cursor-pointer">
            Terms and Policies
          </button>

          {/* Hover Menu with Policy Pages */}
          {isHovered && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 rounded-md bg-white border border-neutral-200 shadow-md py-2 z-50 animate-in fade-in duration-150">
              <Link 
                href="/privacy-policy" 
                className="block px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 hover:text-black transition-colors"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/shopping-policy" 
                className="block px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 hover:text-black transition-colors"
              >
                Shopping Policy
              </Link>
              <Link 
                href="/contact-information" 
                className="block px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 hover:text-black transition-colors"
              >
                Contact Information
              </Link>
            </div>
          )}
        </div>

        {/* Right: Location Tag + Back to Top Button */}
        <div className="flex items-center space-x-6 text-neutral-800">
          <div className="flex items-center space-x-1 text-neutral-500">
            <MapPin className="h-3.5 w-3.5 stroke-[1.8]" />
            <span className="text-[11px] font-medium tracking-wider uppercase">
              Purok 3, Brgy. Bambang, Nagcarlan, Laguna
            </span>
          </div>

          <button
            onClick={scrollToTop}
            aria-label="Back to top"
            className="flex items-center space-x-1.5 text-neutral-600 hover:text-black transition-colors focus:outline-none cursor-pointer"
          >
            <span className="text-[11px] font-normal uppercase tracking-wider">Top</span>
            <ArrowUp className="h-3.5 w-3.5 stroke-[1.8]" />
          </button>
        </div>

      </div>
    </footer>
  );
}