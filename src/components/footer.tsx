"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowUp } from "lucide-react";

export default function Footer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showDropdown = isHovered || isOpen;

  return (
    <footer className="w-full bg-white font-helvetica text-xs text-neutral-500">
      <div className="flex items-center justify-between sm:grid sm:grid-cols-3 h-16 sm:h-20 px-4 sm:px-8 max-w-360 mx-auto">
        {/* Left: Copyright */}
        <div className="flex items-center justify-start text-[10.5px] sm:text-xs text-neutral-500 whitespace-nowrap shrink-0 sm:shrink">
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
            className="text-[11px] sm:text-xs text-neutral-600 hover:text-black transition-colors focus:outline-none cursor-pointer text-center whitespace-nowrap px-1"
          >
            <span>Terms and Policies</span>
          </button>

          {/* Pop-up Menu with Policy Pages */}
          {showDropdown && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 sm:w-52 rounded-xl bg-white border border-neutral-200/80 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
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
        <div className="flex items-center justify-end text-neutral-800 shrink-0 sm:shrink">
          <button
            onClick={scrollToTop}
            aria-label="Back to top"
            className="flex items-center space-x-1 text-neutral-600 hover:text-black transition-colors focus:outline-none cursor-pointer"
          >
            <span className="text-[10.5px] sm:text-xs font-normal uppercase tracking-wider">Top</span>
            <ArrowUp className="h-3.5 w-3.5 stroke-[1.8]" />
          </button>
        </div>
      </div>
    </footer>
  );
}