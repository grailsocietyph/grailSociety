"use client";

import { useState, useMemo } from "react";
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
  X
} from "lucide-react";

type SortOption = 
  | "Featured" 
  | "Alphabetically, A-Z" 
  | "Alphabetically, Z-A" 
  | "Price, low to high" 
  | "Price, high to low" 
  | "Date, old to new" 
  | "Date, new to old";

export default function NewArrivalsPage() {
  const { products, loading } = useProducts();

  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [inStockChecked, setInStockChecked] = useState(true);
  const [outOfStockChecked, setOutOfStockChecked] = useState(true);
  const [minPrice, setMinPrice] = useState<string>("0");
  const [maxPrice, setMaxPrice] = useState<string>("50000");
  const [currentSort, setCurrentSort] = useState<SortOption | null>(null);
  const [isDenseGrid, setIsDenseGrid] = useState(false);

  const publishedNewArrivals = useMemo(() => {
    return products.filter((p) => p.status === "published" && p.isNewArrival);
  }, [products]);

  const filteredProducts = useMemo(() => {
    const min = parseFloat(minPrice) || 0;
    const max = parseFloat(maxPrice) || Infinity;

    return publishedNewArrivals.filter((product) => {
      if (product.isSoldOut && !outOfStockChecked) return false;
      if (!product.isSoldOut && !inStockChecked) return false;
      if (product.priceNum < min || product.priceNum > max) return false;
      return true;
    }).sort((a, b) => {
      if (!currentSort) return 0;
      switch (currentSort) {
        case "Featured":
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
  }, [publishedNewArrivals, inStockChecked, outOfStockChecked, minPrice, maxPrice, currentSort]);

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

        {/* Top padding offset */}
        <section className="mx-auto max-w-360 px-4 sm:px-8 pt-24 sm:pt-32 pb-16">
          
          {/* Main Title Header */}
          <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight mb-8">
            New Arrivals
          </h1>

          {/* Clean Control Bar */}
          <div className="flex items-center justify-between pb-6 mb-8 border-b border-neutral-100">
            {/* Left: Item count solo */}
            <span className="text-neutral-500 text-[15px] font-normal">
              {filteredProducts.length} {filteredProducts.length === 1 ? "item" : "items"}
            </span>

            {/* Right: Filter & Sort Button + Grid toggle */}
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => setIsFilterSidebarOpen(true)}
                className="flex items-center space-x-2 text-neutral-900 hover:text-black transition-colors focus:outline-none cursor-pointer font-medium text-sm bg-neutral-100 hover:bg-neutral-200 px-4 py-2 rounded-xl"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filter & Sort</span>
              </button>

              <div className="hidden sm:flex items-center space-x-2 text-neutral-400">
                <button 
                  onClick={() => setIsDenseGrid(false)}
                  aria-label="Standard Grid View"
                  className={`p-1 transition-colors cursor-pointer ${!isDenseGrid ? "text-black" : "hover:text-black"}`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setIsDenseGrid(true)}
                  aria-label="Dense Grid View"
                  className={`p-1 transition-colors cursor-pointer ${isDenseGrid ? "text-black" : "hover:text-black"}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Product Grid (4 columns default layout) */}
          {filteredProducts.length > 0 ? (
            <div className={`grid gap-x-4 gap-y-10 ${
              isDenseGrid 
                ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8" 
                : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            }`}>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center text-sm text-neutral-500">
              {loading ? "Loading new arrivals..." : "No new arrival items found."}
            </div>
          )}
        </section>
      </div>

      {/* Sliding Filter & Sort Sidebar Drawer */}
      {isFilterSidebarOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Overlay */}
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
  const primaryImage = product.images?.[0] || "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9";
  const secondaryImage = product.images?.[1] || primaryImage;

  return (
    <Link 
      href={`/products/${product.id}`} 
      className="group/card flex flex-col cursor-pointer"
    >
      <div
        className="relative aspect-square w-full overflow-hidden bg-neutral-100 rounded-none mb-3"
        onMouseEnter={() => {
          if (product.images && product.images.length > 1) {
            setCurrentImageIndex(1);
          }
        }}
        onMouseLeave={() => {
          setCurrentImageIndex(0);
        }}
      >
        <Image
          src={currentImageIndex === 1 ? secondaryImage : primaryImage}
          alt={product.title}
          fill
          unoptimized
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-center transition-transform duration-500 group-hover/card:scale-105"
        />

        {product.isSoldOut && (
          <span className="absolute top-2 right-2 rounded-full bg-neutral-200/90 px-2.5 py-1 text-[10px] font-normal text-neutral-800 backdrop-blur-xs">
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