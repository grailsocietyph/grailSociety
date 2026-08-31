"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowUp } from "lucide-react";

export default function Footer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current && !menuRef.current.contains(target) &&
        mobileMenuRef.current && !mobileMenuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showDropdown = isHovered || isOpen;

  return (
    <footer className="w-full bg-white border-t border-neutral-100 font-helvetica text-xs text-neutral-500">

      {/* ================= DESKTOP VIEW (sm and up) ================= */}
      <div className="hidden sm:grid sm:grid-cols-3 items-center h-20 px-6 sm:px-8 max-w-360 mx-auto">
        {/* Left: Copyright */}
        <div className="flex items-center justify-start text-neutral-500">
          © 2026 Grail Society
        </div>

        {/* Center: Grouped Terms and Policies with Pop-up Dropdown */}
        <div
          ref={menuRef}
          className="relative flex items-center justify-center py-2"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="text-neutral-600 hover:text-black transition-colors focus:outline-none cursor-pointer"
          >
            <span>Terms and Policies</span>
          </button>

          {/* Pop-up Menu with Policy Pages */}
          {showDropdown && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-52 rounded-xl bg-white border border-neutral-200/80 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <Link
                href="/privacy-policy"
                onClick={() => { setIsOpen(false); setIsHovered(false); }}
                className="block px-4 py-2.5 text-xs text-neutral-700 hover:bg-neutral-50 hover:text-black transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/shopping-policy"
                onClick={() => { setIsOpen(false); setIsHovered(false); }}
                className="block px-4 py-2.5 text-xs text-neutral-700 hover:bg-neutral-50 hover:text-black transition-colors"
              >
                Shopping Policy
              </Link>
              <Link
                href="/contact-information"
                onClick={() => { setIsOpen(false); setIsHovered(false); }}
                className="block px-4 py-2.5 text-xs text-neutral-700 hover:bg-neutral-50 hover:text-black transition-colors"
              >
                Contact Information
              </Link>
            </div>
          )}
        </div>

        {/* Right: Back to Top Button */}
        <div className="flex items-center justify-end text-neutral-800">
          <button
            onClick={scrollToTop}
            aria-label="Back to top"
            className="flex items-center space-x-1 text-neutral-600 hover:text-black transition-colors focus:outline-none cursor-pointer"
          >
            <span className="text-[11px] font-normal uppercase tracking-wider">Top</span>
            <ArrowUp className="h-3.5 w-3.5 stroke-[1.8]" />
          </button>
        </div>
      </div>

      {/* ================= MOBILE VIEW (< sm) ================= */}
      <div className="sm:hidden px-5 py-6 space-y-4 text-center">

        {/* Grouped Terms & Policies Dropdown Button */}
        <div ref={mobileMenuRef} className="relative inline-block">
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="text-neutral-700 hover:text-black font-medium transition-colors focus:outline-none cursor-pointer px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200/60 text-xs"
          >
            <span>Terms and Policies</span>
          </button>

          {/* Mobile Pop-up Menu */}
          {isOpen && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-52 rounded-xl bg-white border border-neutral-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 text-left">
              <Link
                href="/privacy-policy"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2.5 text-xs text-neutral-700 hover:bg-neutral-50 hover:text-black transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/shopping-policy"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2.5 text-xs text-neutral-700 hover:bg-neutral-50 hover:text-black transition-colors"
              >
                Shopping Policy
              </Link>
              <Link
                href="/contact-information"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2.5 text-xs text-neutral-700 hover:bg-neutral-50 hover:text-black transition-colors"
              >
                Contact Information
              </Link>
            </div>
          )}
        </div>

        {/* Bottom Split: Copyright + Back to Top */}
        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-neutral-500 text-[11px]">
          <span>© 2026 Grail Society</span>

          <button
            onClick={scrollToTop}
            aria-label="Back to top"
            className="flex items-center space-x-1 text-neutral-600 hover:text-black transition-colors p-1 cursor-pointer font-medium uppercase tracking-wider"
          >
            <span>Top</span>
            <ArrowUp className="h-3.5 w-3.5 stroke-[1.8]" />
          </button>
        </div>

      </div>

    </footer>
  );
}