"use client";

import { useState, useMemo, use, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useProducts, Product } from "@/context/ProductContext";
import { 
  LayoutGrid, 
  Grid3X3,
  Check,
  SlidersHorizontal,
  X,
  ArrowLeft,
  ArrowRight
} from "lucide-react";

type SortOption = 
  | "Featured" 
  | "Alphabetically, A-Z" 
  | "Alphabetically, Z-A" 
  | "Price, low to high" 
  | "Price, high to low" 
  | "Date, old to new" 
  | "Date, new to old";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function CollectionDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const collectionSlug = resolvedParams.slug;
  const { products, loading } = useProducts();

  // Format title nicely from slug (e.g., "t-shirts" -> "T-Shirts")
  const collectionTitle = collectionSlug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [inStockChecked, setInStockChecked] = useState(true);
  const [outOfStockChecked, setOutOfStockChecked] = useState(true);
  const [minPrice, setMinPrice] = useState<string>("0");
  const [maxPrice, setMaxPrice] = useState<string>("50000");
  const [currentSort, setCurrentSort] = useState<SortOption | null>(null);
  const [isDenseGrid, setIsDenseGrid] = useState(false);

  // Filter products matching the current collection slug and published status
  const publishedCollectionProducts = useMemo(() => {
    return products.filter(
      (p) => p.status === "published" && p.collectionSlug.toLowerCase() === collectionSlug.toLowerCase()
    );
  }, [products, collectionSlug]);

  const filteredProducts = useMemo(() => {
    const min = parseFloat(minPrice) || 0;
    const max = parseFloat(maxPrice) || Infinity;

    return publishedCollectionProducts.filter((product) => {
      if (product.isSoldOut && !outOfStockChecked) return false;
      if (!product.isSoldOut && !inStockChecked) return false;
      if (product.priceNum < min || product.priceNum > max) return false;
      return true;
    }).sort((a, b) => {
      if (!currentSort) return 0;
      switch (currentSort) {
        case "Featured":
          // Display all new arrivals first, then other items by newest date
          if (a.isNewArrival && !b.isNewArrival) return -1;
          if (!a.isNewArrival && b.isNewArrival) return 1;
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        case "Alphabetically, A-Z":
          return a.title.localeCompare(b.title);
        case "Alphabetically, Z-A":
          return b.title.localeCompare(a.title);
        case "Price, low to high":
          return a.priceNum - b.priceNum;
        case "Price, high to low":
          return b.priceNum - a.priceNum;
        case "Date, old to new":
          return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
        case "Date, new to old":
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        default:
          return 0;
      }
    });
  }, [publishedCollectionProducts, inStockChecked, outOfStockChecked, minPrice, maxPrice, currentSort]);

  const sortOptionsList: SortOption[] = [
    "Featured",
    "Alphabetically, A-Z",
    "Alphabetically, Z-A",
    "Price, low to high",
    "Price, high to low",
    "Date, old to new",
    "Date, new to old",
  ];

  return (
    <main className="min-h-screen bg-white flex flex-col justify-between font-helvetica">
      <div>
        <Header />

        {/* Top padding offset with generous breathing room */}
        <section className="mx-auto max-w-360 px-4 sm:px-8 pt-32 sm:pt-36 lg:pt-40 pb-16">
          <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight mb-8">
            {collectionTitle}
          </h1>

          {/* Control Bar */}
          <div className="flex items-center justify-between pb-6 mb-8 border-b border-neutral-100">
            <span className="text-neutral-500 text-[15px] font-normal">
              {filteredProducts.length} {filteredProducts.length === 1 ? "item" : "items"}
            </span>

            {/* Right: Filter & Sort Button + Segmented Grid toggle */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <button 
                onClick={() => setIsFilterSidebarOpen(true)}
                className="flex items-center space-x-2 text-neutral-900 hover:text-black transition-colors focus:outline-none cursor-pointer font-medium text-xs sm:text-sm bg-neutral-100 hover:bg-neutral-200 px-3 sm:px-4 py-2 rounded-xl"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filter & Sort</span>
              </button>

              {/* Segmented Grid Toggle (Always Visible on Mobile & Desktop) */}
              <div className="flex items-center bg-neutral-100 p-1 rounded-xl shrink-0">
                <button 
                  onClick={() => setIsDenseGrid(false)}
                  aria-label="Standard Grid View (2 items on mobile)"
                  title="Standard View (2-col on mobile)"
                  className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                    !isDenseGrid 
                      ? "bg-white text-black shadow-xs" 
                      : "text-neutral-400 hover:text-neutral-700"
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setIsDenseGrid(true)}
                  aria-label="Dense Grid View (3 items on mobile)"
                  title="Minimize / Dense View (3-col on mobile)"
                  className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                    isDenseGrid 
                      ? "bg-white text-black shadow-xs" 
                      : "text-neutral-400 hover:text-neutral-700"
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Product Grid (Default 2 items on mobile, 3 items dense) */}
          {filteredProducts.length > 0 ? (
            <div className={`grid gap-x-3.5 sm:gap-x-4 gap-y-6 sm:gap-y-10 ${
              isDenseGrid 
                ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8" 
                : "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            }`}>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-neutral-500 text-sm">
              {loading ? "Loading collection items..." : "No items available in this collection yet. Check back soon!"}
            </div>
          )}
        </section>
      </div>

      {/* Sliding Filter Sidebar Drawer */}
      {isFilterSidebarOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsFilterSidebarOpen(false)}
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                  <h2 className="text-lg font-bold text-neutral-900">Filter & Sort</h2>
                  <button 
                    onClick={() => setIsFilterSidebarOpen(false)}
                    className="p-1 text-neutral-500 hover:text-black transition-colors cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="py-6 space-y-8 overflow-y-auto max-h-[calc(100vh-200px)]">
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900 mb-4">Sort By</h3>
                    <div className="flex flex-col space-y-3">
                      {sortOptionsList.map((opt) => {
                        const isSelected = currentSort === opt;
                        return (
                          <button
                            key={opt}
                            onClick={() => setCurrentSort((prev) => (prev === opt ? null : opt))}
                            className="flex items-center w-full text-left focus:outline-none group cursor-pointer"
                          >
                            <span className="w-6 flex justify-start shrink-0 text-neutral-900">
                              {isSelected && <Check className="h-4 w-4 stroke-[2.2]" />}
                            </span>
                            <span className={`text-sm transition-colors ${
                              isSelected ? "font-bold text-black" : "font-normal text-neutral-700 group-hover:text-black"
                            }`}>
                              {opt}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t border-neutral-100 pt-6">
                    <h3 className="text-sm font-semibold text-neutral-900 mb-4">Availability</h3>
                    <div className="space-y-3 text-sm text-neutral-700">
                      <label className="flex items-center space-x-3 cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={inStockChecked} 
                          onChange={(e) => setInStockChecked(e.target.checked)}
                          className="h-4 w-4 rounded border-neutral-300 text-black focus:ring-0 accent-black cursor-pointer" 
                        />
                        <span>In stock</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={outOfStockChecked} 
                          onChange={(e) => setOutOfStockChecked(e.target.checked)}
                          className="h-4 w-4 rounded border-neutral-300 text-black focus:ring-0 accent-black cursor-pointer" 
                        />
                        <span>Out of stock</span>
                      </label>
                    </div>
                  </div>

                  <div className="border-t border-neutral-100 pt-6">
                    <h3 className="text-sm font-semibold text-neutral-900 mb-4">Price (₱)</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="block text-[11px] text-neutral-500 uppercase mb-1">From</label>
                        <input 
                          type="number" 
                          value={minPrice} 
                          onChange={(e) => setMinPrice(e.target.value)}
                          placeholder="0"
                          className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-black"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[11px] text-neutral-500 uppercase mb-1">To</label>
                        <input 
                          type="number" 
                          value={maxPrice} 
                          onChange={(e) => setMaxPrice(e.target.value)}
                          placeholder="50000"
                          className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-black"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              <div className="pt-4 border-t border-neutral-200 flex gap-4">
                <button 
                  onClick={() => {
                    setInStockChecked(true);
                    setOutOfStockChecked(true);
                    setMinPrice("0");
                    setMaxPrice("50000");
                    setCurrentSort(null);
                  }}
                  className="w-full py-3 bg-neutral-100 text-neutral-900 text-sm font-medium hover:bg-neutral-200 transition-colors rounded-xl cursor-pointer"
                >
                  Reset
                </button>
                <button 
                  onClick={() => setIsFilterSidebarOpen(false)}
                  className="w-full py-3 bg-black text-white text-sm font-medium hover:bg-neutral-800 transition-colors rounded-xl cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}

function ProductCard({ product }: { product: Product }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const images = product.images && product.images.length > 0 
    ? product.images 
    : ["https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9"];
  const hasMultiple = images.length > 1;

  const showControls = () => {
    setIsInteracting(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsInteracting(false);
    }, 2000);
  };

  const handlePrev = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    showControls();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    showControls();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    showControls();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || !hasMultiple) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;

    if (Math.abs(diffX) > 30) {
      showControls();
      if (diffX > 0) {
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      } else {
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      }
    }
    setTouchStartX(null);
  };

  return (
    <Link 
      href={`/products/${product.id}`} 
      className="group/card flex flex-col cursor-pointer"
    >
      <div 
        className="relative aspect-square w-full overflow-hidden bg-neutral-100 rounded-none mb-3 select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={images[currentImageIndex]}
          alt={product.title}
          fill
          unoptimized
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-center transition-transform duration-200 ease-out group-hover/card:scale-105"
        />

        {/* Left / Right Slide Preview Arrows for multiple images (revealed only when user is in it) */}
        {hasMultiple && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={handlePrev}
              className={`absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-20 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] transition-all duration-200 p-1 hover:scale-110 active:scale-90 cursor-pointer ${
                isInteracting ? "opacity-100" : "opacity-0 group-hover/card:opacity-100"
              }`}
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2.5]" />
            </button>

            <button
              type="button"
              aria-label="Next image"
              onClick={handleNext}
              className={`absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-20 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] transition-all duration-200 p-1 hover:scale-110 active:scale-90 cursor-pointer ${
                isInteracting ? "opacity-100" : "opacity-0 group-hover/card:opacity-100"
              }`}
            >
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2.5]" />
            </button>

            {/* Subtle pagination dots */}
            <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-1 transition-opacity duration-200 ${
              isInteracting ? "opacity-100" : "opacity-0 group-hover/card:opacity-100"
            }`}>
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    idx === currentImageIndex 
                      ? "w-3 bg-white drop-shadow-md" 
                      : "w-1.5 bg-white/60 drop-shadow-xs"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {product.isSoldOut && (
          <span className="absolute top-2 right-2 rounded-full bg-neutral-200/90 px-2.5 py-1 text-[10px] font-normal text-neutral-800 backdrop-blur-xs z-10">
            Sold out
          </span>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-xs sm:text-sm font-normal text-neutral-800 line-clamp-2 leading-tight">
          {product.title}
        </h3>
        <p className="text-xs sm:text-sm font-medium text-neutral-900">
          {product.priceFormatted}
        </p>
      </div>
    </Link>
  );
}