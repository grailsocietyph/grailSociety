"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, X, ArrowRight } from "lucide-react";
import { useAnnouncement } from "@/context/AnnouncementContext";
import { useProducts } from "@/context/ProductContext";
import { getCategoryLabel } from "@/lib/categories";

export default function Header() {
  const { announcement } = useAnnouncement();
  const { products } = useProducts();
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

  // Filter published matching products for search suggestions
  const matchingProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];
    return products.filter((product) => {
      if (product.status !== "published") return false;
      const matchTitle = (product.title || "").toLowerCase().includes(q);
      const matchCol = (product.collectionSlug || "").toLowerCase().includes(q);
      const matchCond = (product.condition || "").toLowerCase().includes(q);
      const matchSize = (product.tagSize || "").toLowerCase().includes(q);
      return matchTitle || matchCol || matchCond || matchSize;
    });
  }, [products, searchQuery]);

  const suggestedProducts = useMemo(() => {
    return matchingProducts.slice(0, 5);
  }, [matchingProducts]);

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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const isTransparent = isHomePage && !isScrolled;
  const logoSrc = isTransparent ? "/white-logo.png" : "/black-logo.png";

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setIsMenuOpen(false);
    }
  };

  const handleSelectProduct = (productId: string) => {
    setIsSearchOpen(false);
    setIsMenuOpen(false);
    setSearchQuery("");
    router.push(`/products/${productId}`);
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
                  {[...Array(24)].map((_, i) => (
                    <span key={i} className="flex items-center gap-8 font-bold tracking-widest uppercase shrink-0">
                      <span>{announcement.text}</span>
                      <span className="text-neutral-500">✦</span>
                    </span>
                  ))}
                </div>
              </Link>
            ) : (
              <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
                {[...Array(24)].map((_, i) => (
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

          {/* ================= RIGHT COLUMN (Search Bar + Suggestions) ================= */}
          <div className="flex items-center justify-end" ref={searchRef}>
            {/* Mobile Search Active Overlay Header */}
            {isSearchOpen && (
              <div className="sm:hidden absolute inset-0 z-30 flex items-center px-4 bg-white/98 backdrop-blur-md shadow-xs transition-all animate-in fade-in duration-150">
                <form onSubmit={handleSearchSubmit} className="w-full flex items-center gap-3">
                  <Search className="h-4 w-4 text-neutral-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setIsSearchOpen(false);
                      }
                    }}
                    placeholder="Search drops, brands, items..."
                    autoFocus
                    className="flex-1 py-2 text-sm text-neutral-900 bg-transparent focus:outline-none placeholder:text-neutral-400 font-helvetica"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="text-xs font-semibold text-neutral-700 hover:text-black py-1 px-1.5 cursor-pointer uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                </form>
              </div>
            )}

            <div className="relative flex items-center justify-end transition-all duration-300 w-full max-w-[280px] lg:max-w-[340px]">
              {isSearchOpen ? (
                /* Desktop Inline Search Form */
                <form onSubmit={handleSearchSubmit} className="hidden sm:flex w-full items-center relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setIsSearchOpen(false);
                      }
                    }}
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
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }}
                    aria-label="Close search"
                    className={`absolute right-1 p-1 hover:opacity-75 transition-opacity cursor-pointer ${
                      isTransparent ? "text-white" : "text-neutral-700"
                    }`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <>
                  {/* Mobile Search Icon Button */}
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    aria-label="Open Search"
                    className={`sm:hidden p-2 hover:opacity-75 transition-opacity cursor-pointer ${
                      isTransparent ? "text-white" : "text-neutral-900"
                    }`}
                  >
                    <Search className="h-6 w-6 stroke-[1.8]" />
                  </button>

                  {/* Tablet/Desktop Search Pill Button */}
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    aria-label="Open Search"
                    className={`hidden sm:flex w-full items-center justify-between px-4 py-2 rounded-xl border transition-all cursor-pointer ${
                      isTransparent
                        ? "text-white/90 border-white/30 hover:border-white bg-white/10 backdrop-blur-xs"
                        : "text-neutral-600 border-neutral-200 hover:border-neutral-400 bg-neutral-50"
                    }`}
                  >
                    <span className="text-xs font-normal tracking-wide">Search drops...</span>
                    <Search className="h-4 w-4 stroke-[1.8] shrink-0 ml-2" />
                  </button>
                </>
              )}

              {/* ================= SEARCH SUGGESTIONS POPUP (Fully Mobile Responsive) ================= */}
              {isSearchOpen && searchQuery.trim().length > 0 && (
                <div className="fixed top-16 left-3 right-3 sm:absolute sm:top-full sm:left-auto sm:right-0 sm:mt-3 w-auto sm:w-[380px] max-w-[calc(100vw-1.5rem)] bg-white text-neutral-900 rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 font-helvetica">
                  
                  {/* Dropdown Header */}
                  <div className="px-4 py-2.5 border-b border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400 font-semibold uppercase tracking-wider bg-neutral-50/70">
                    <span>Suggested Items ({matchingProducts.length})</span>
                    <span className="text-[10px] font-normal lowercase text-neutral-400 hidden sm:inline">press enter to search</span>
                  </div>

                  {/* Suggestions List */}
                  {suggestedProducts.length > 0 ? (
                    <div className="divide-y divide-neutral-100 max-h-[60vh] sm:max-h-[340px] overflow-y-auto">
                      {suggestedProducts.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleSelectProduct(item.id)}
                          className="flex items-center gap-3.5 p-3 hover:bg-neutral-50 transition-colors group cursor-pointer"
                        >
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200/70">
                            <Image
                              src={item.images?.[0] || "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9"}
                              alt={item.title}
                              fill
                              unoptimized
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-neutral-900 truncate group-hover:text-black">
                              {item.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-500">
                              {item.collectionSlug && (
                                <span>{getCategoryLabel(item.collectionSlug)}</span>
                              )}
                              {item.collectionSlug && item.tagSize && <span>•</span>}
                              {item.tagSize && (
                                <span>Size {item.tagSize}</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs sm:text-sm font-bold text-neutral-900">
                              {item.priceFormatted || `₱${item.priceNum?.toLocaleString()}`}
                            </p>
                            {item.isSoldOut && (
                              <span className="text-[10px] text-neutral-400 font-medium block">Sold out</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-xs sm:text-sm text-neutral-500">
                      <p className="font-medium text-neutral-800 mb-1">No products found</p>
                      <p className="text-xs text-neutral-400">No matching items for &ldquo;{searchQuery}&rdquo;</p>
                    </div>
                  )}

                  {/* Dropdown Footer: View All Matches */}
                  {matchingProducts.length > 0 && (
                    <div className="p-2.5 bg-neutral-50 border-t border-neutral-100 text-center">
                      <button
                        type="button"
                        onClick={() => handleSearchSubmit()}
                        className="w-full py-2 text-xs font-semibold text-neutral-900 hover:text-black hover:underline cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>View all {matchingProducts.length} results</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </header>

      {/* ================= MOBILE DRAWER (Minimalist Sidebar) ================= */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-100 bg-white flex flex-col px-6 py-6 font-helvetica md:hidden animate-in fade-in duration-200 overflow-y-auto">
          {/* Top Close Button */}
          <div className="flex items-center justify-end">
            <button
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close Menu"
              className="p-1 -mr-1 text-neutral-800 hover:text-black transition-colors cursor-pointer"
            >
              <X className="h-7 w-7 stroke-[1.5]" />
            </button>
          </div>

          {/* Navigation Links (font-normal, positioned cleanly at top) */}
          <nav className="flex flex-col space-y-6 mt-6 text-[28px] font-normal tracking-tight text-neutral-900">
            <Link 
              href="/" 
              onClick={() => setIsMenuOpen(false)}
              className="hover:opacity-70 transition-opacity"
            >
              Home
            </Link>
            <Link 
              href="/new-arrivals" 
              onClick={() => setIsMenuOpen(false)}
              className="hover:opacity-70 transition-opacity"
            >
              New Arrivals
            </Link>
            <Link 
              href="/shop" 
              onClick={() => setIsMenuOpen(false)}
              className="hover:opacity-70 transition-opacity"
            >
              Shop All
            </Link>
            <Link 
              href="/collections" 
              onClick={() => setIsMenuOpen(false)}
              className="hover:opacity-70 transition-opacity"
            >
              Collections
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}