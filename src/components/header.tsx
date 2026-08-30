"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, X } from "lucide-react";
import { useAnnouncement } from "@/context/AnnouncementContext";

export default function Header() {
  const { announcement } = useAnnouncement();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const pathname = usePathname();
  const isHomePage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [lastScrollY]);

  const isTransparent = isHomePage && !isScrolled;
  const logoSrc = isTransparent ? "/white-logo.png" : "/black-logo.png";

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <>
      {/* ================= HEADER ================= */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ease-in-out border-none outline-none ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        } ${isTransparent ? "bg-transparent" : "bg-white/95 backdrop-blur-md shadow-2xs"}`}
      >
        {/* ================= TOP BLACK SCROLLING ANNOUNCEMENT TICKER ================= */}
        {announcement && announcement.isActive && announcement.text.trim() && (
          <div className="w-full bg-black text-white text-[11px] sm:text-xs py-2 border-b border-neutral-900 overflow-hidden select-none shadow-xs">
            {announcement.link ? (
              <Link href={announcement.link} className="block w-full overflow-hidden hover:opacity-85 transition-opacity">
                <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
                  {[...Array(6)].map((_, i) => (
                    <span key={i} className="flex items-center gap-8 font-bold tracking-widest uppercase shrink-0">
                      <span>{announcement.text}</span>
                      <span className="text-neutral-500">✦</span>
                    </span>
                  ))}
                </div>
              </Link>
            ) : (
              <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
                {[...Array(6)].map((_, i) => (
                  <span key={i} className="flex items-center gap-8 font-bold tracking-widest uppercase shrink-0">
                    <span>{announcement.text}</span>
                    <span className="text-neutral-500">✦</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mx-auto grid grid-cols-3 items-center h-16 sm:h-20 lg:h-24 px-4 sm:px-8 max-w-360">

          {/* ================= LEFT COLUMN ================= */}
          <div className="flex items-center justify-start">
            <button
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open Menu"
              className={`md:hidden p-2 hover:opacity-75 transition-opacity cursor-pointer ${
                isTransparent ? "text-white" : "text-neutral-900"
              }`}
            >
              <Menu className="h-6 w-6 stroke-[1.8]" />
            </button>

            <nav
              className={`hidden md:flex items-center space-x-6 lg:space-x-8 text-sm lg:text-[15px] font-normal tracking-tight font-helvetica ${
                isTransparent ? "text-white" : "text-neutral-800"
              }`}
            >
              <Link href="/" className="hover:opacity-75 transition-opacity">
                Home
              </Link>
              <Link href="/new-arrivals" className="hover:opacity-75 transition-opacity whitespace-nowrap">
                New Arrivals
              </Link>
              <Link href="/shop" className="hover:opacity-75 transition-opacity whitespace-nowrap">
                Shop All
              </Link>
              <Link href="/collections" className="hover:opacity-75 transition-opacity">
                Collections
              </Link>
            </nav>
          </div>

          {/* ================= CENTER LOGO ================= */}
          <div className="flex justify-center items-center">
            <Link
              href="/"
              className="flex items-center justify-center"
              aria-label="Grail Society Home"
            >
              <Image
                src={logoSrc}
                alt="Grail Society"
                width={160}
                height={80}
                priority
                className={`w-auto object-contain ${
                  isTransparent ? "h-10 sm:h-12 lg:h-14" : "h-14 sm:h-16 lg:h-[72px]"
                }`}
              />
            </Link>
          </div>

          {/* ================= RIGHT COLUMN (Expanded Search Bar) ================= */}
          <div className="flex items-center justify-end" ref={searchRef}>
            <div className={`relative flex items-center transition-all duration-300 w-full max-w-[220px] sm:max-w-[320px] lg:max-w-[360px]`}>
              {isSearchOpen ? (
                <form onSubmit={handleSearchSubmit} className="w-full flex items-center relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search drops, brands, items..."
                    autoFocus
                    className={`w-full py-2 pl-3 pr-8 text-xs sm:text-sm bg-transparent border-b transition-colors focus:outline-none ${
                      isTransparent 
                        ? "text-white border-white/70 placeholder:text-white/60 focus:border-white" 
                        : "text-neutral-900 border-neutral-400 placeholder:text-neutral-400 focus:border-black"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    aria-label="Close search"
                    className={`absolute right-1 p-1 hover:opacity-75 transition-opacity cursor-pointer ${
                      isTransparent ? "text-white" : "text-neutral-700"
                    }`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  aria-label="Open Search"
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-xl border transition-all cursor-pointer ${
                    isTransparent
                      ? "text-white/90 border-white/30 hover:border-white bg-white/10 backdrop-blur-xs"
                      : "text-neutral-600 border-neutral-200 hover:border-neutral-400 bg-neutral-50"
                  }`}
                >
                  <span className="text-xs font-normal tracking-wide">Search drops...</span>
                  <Search className="h-4 w-4 stroke-[1.8] shrink-0 ml-2" />
                </button>
              )}
            </div>
          </div>

        </div>
      </header>

      {/* ================= MOBILE DRAWER ================= */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-100 bg-white flex flex-col px-6 py-6 font-helvetica md:hidden animate-in fade-in duration-200">
          <div className="flex justify-start">
            <button
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close Menu"
              className="p-1 text-neutral-800 hover:text-black cursor-pointer"
            >
              <X className="h-7 w-7 stroke-[1.5]" />
            </button>
          </div>

          <nav className="flex flex-col space-y-6 mt-8 text-[28px] font-normal tracking-tight text-neutral-900">
            <Link href="/" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
            <Link href="/new-arrivals" onClick={() => setIsMenuOpen(false)}>
              New Arrivals
            </Link>
            <Link href="/shop" onClick={() => setIsMenuOpen(false)}>
              Shop All
            </Link>
            <Link href="/collections" onClick={() => setIsMenuOpen(false)}>
              Collections
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}