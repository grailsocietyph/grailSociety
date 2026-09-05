"use client";

import { useState, use, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { ChevronLeft, ChevronRight, X, Copy, Check, ShoppingBag, Gift } from "lucide-react";
import { useProducts, Product } from "@/context/ProductContext";
import { supabase, mapDbProductToProduct, DbProduct } from "@/lib/supabase";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  const { products, loading: contextLoading } = useProducts();

  const [mounted, setMounted] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeScrollIndex, setActiveScrollIndex] = useState(0);
  const lightboxContainerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [directProduct, setDirectProduct] = useState<Product | null>(null);
  const [directLoading, setDirectLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Find product in context
  const foundInContext = products.find((p) => p.id === productId);

  // If not found in context, attempt to fetch directly from Supabase
  useEffect(() => {
    if (!foundInContext && productId) {
      let isCancelled = false;
      setDirectLoading(true);

      async function fetchDirect() {
        try {
          const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("id", productId)
            .single();

          if (!isCancelled) {
            if (data && !error) {
              setDirectProduct(mapDbProductToProduct(data as DbProduct));
            }
          }
        } catch (err) {
          console.error("Direct fetch product error:", err);
        } finally {
          if (!isCancelled) setDirectLoading(false);
        }
      }

      fetchDirect();

      return () => {
        isCancelled = true;
      };
    }
  }, [foundInContext, productId]);

  const product = foundInContext || directProduct || products[0];

  const productImages = product?.images && product.images.length > 0
    ? product.images
    : ["https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9"];

  const suggestedProducts = products.length > 1
    ? products.filter((p) => p.id !== product?.id).slice(0, 4)
    : products.slice(0, 4);

  // Auto-scroll to clicked image when lightbox opens & lock body scroll
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = "hidden";
      setActiveScrollIndex(lightboxIndex);
      
      const timer = setTimeout(() => {
        const el = document.getElementById(`lightbox-img-${lightboxIndex}`);
        if (el) {
          el.scrollIntoView({ block: "start" });
        }
      }, 60);

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "";
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [lightboxIndex]);

  // IntersectionObserver to sync active thumbnail while scrolling inside the lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;

    const items = document.querySelectorAll(".lightbox-scroll-item");
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            if (!isNaN(index)) {
              setActiveScrollIndex(index);
            }
          }
        });
      },
      {
        root: lightboxContainerRef.current,
        threshold: 0.5,
      }
    );

    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [lightboxIndex, productImages.length]);

  // Auto-scroll mobile bottom thumbnail into view when active image changes
  useEffect(() => {
    if (lightboxIndex === null) return;
    const mobileThumb = document.getElementById(`mobile-thumb-${activeScrollIndex}`);
    if (mobileThumb) {
      mobileThumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeScrollIndex, lightboxIndex]);

  // Auto-scroll storefront thumbnail into view when active image changes
  useEffect(() => {
    const thumb = document.getElementById(`storefront-thumb-${activeImageIndex}`);
    if (thumb) {
      thumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  }, [activeImageIndex]);

  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Preload and pre-decode all product images in the background for 0ms instant transitions
  useEffect(() => {
    if (typeof window === "undefined" || !productImages || productImages.length <= 1) return;

    productImages.forEach((src) => {
      if (!src) return;
      const img = new window.Image();
      img.src = src;
      if (img.decode) {
        img.decode().catch(() => {
          // Ignore decoding errors if any
        });
      }
    });
  }, [productImages]);

  // Keyboard navigation for Storefront Viewer & Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || "").toLowerCase();
      if (activeTag === "input" || activeTag === "textarea") return;

      if (lightboxIndex !== null) {
        if (e.key === "Escape") {
          setLightboxIndex(null);
        } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
          const nextIdx = Math.min(productImages.length - 1, activeScrollIndex + 1);
          const el = document.getElementById(`lightbox-img-${nextIdx}`);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
          const prevIdx = Math.max(0, activeScrollIndex - 1);
          const el = document.getElementById(`lightbox-img-${prevIdx}`);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } else {
        if (e.key === "ArrowRight") {
          handleNextImage();
        } else if (e.key === "ArrowLeft") {
          handlePrevImage();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, activeScrollIndex, productImages.length]);

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
    touchEndXRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const isLeftSwipe = distance > 45;
    const isRightSwipe = distance < -45;

    if (isLeftSwipe) {
      handleNextImage();
    } else if (isRightSwipe) {
      handlePrevImage();
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  // Helper to format dimensions with inch unit if missing
  const formatDimension = (label: string, val?: string) => {
    if (!val) return "";
    const trimmed = val.trim();
    if (!trimmed) return "";
    const hasUnit = trimmed.endsWith('"') || trimmed.toLowerCase().endsWith("in") || trimmed.endsWith("cm");
    return `${label}: ${hasUnit ? trimmed : `${trimmed}"`}`;
  };

  // Format measurements for clipboard & view
  const formattedMeasurements = product?.measurementsData?.notes
    ? product.measurementsData.notes
    : [
        formatDimension("Length", product?.measurementsData?.length),
        formatDimension("Width", product?.measurementsData?.width),
        formatDimension("Waist", product?.measurementsData?.waist),
        formatDimension("Leg Opening", product?.measurementsData?.legOpening),
      ].filter(Boolean).join(" | ") || "N/A";

  const handleCopyOrderDetails = () => {
    if (!product) return;
    const mainImageUrl = productImages[0] || "";
    const productUrl = typeof window !== "undefined" ? window.location.href : "";
    
    const issueText = (product.issue || product.measurementsData?.issue)?.trim();
    const modelHeightVal = (product.modelHeight || product.measurementsData?.modelHeight)?.trim();
    const modelWeightVal = (product.modelWeight || product.measurementsData?.modelWeight)?.trim();
    const modelDetailsSummary = [
      modelHeightVal ? `Height: ${modelHeightVal}` : "",
      modelWeightVal ? `Weight: ${modelWeightVal}kg` : "",
    ].filter(Boolean).join(" | ");

    const orderText = `ORDER INQUIRY - GRAIL SOCIETY\n` +
      `• Item: ${product.title}\n` +
      `• Price: ${product.priceFormatted}\n` +
      `• Tag Size: ${product.tagSize || "N/A"}\n` +
      `• Measurements: ${formattedMeasurements}\n` +
      `• Condition: ${product.condition || "N/A"}\n` +
      (issueText ? `• Issue: ${issueText}\n` : "") +
      (modelDetailsSummary ? `• Model Details: ${modelDetailsSummary}\n\n` : `\n`) +
      `Product Link: ${productUrl}\n\n` +
      `Image Link: ${mainImageUrl || "No image uploaded"}`;

    navigator.clipboard.writeText(orderText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  // Conditional early returns (guaranteed to be AFTER all hooks)
  if (!mounted || (contextLoading && !product) || (directLoading && !product)) {
    return (
      <main className="min-h-screen bg-white flex flex-col justify-between font-helvetica">
        <Header />
        <div className="py-32 text-center text-neutral-500">Loading product...</div>
        <Footer />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-white flex flex-col justify-between font-helvetica">
        <Header />
        <div className="py-32 text-center space-y-4">
          <p className="text-neutral-500">Product not found.</p>
          <Link href="/shop" className="text-sm font-semibold underline">
            Back to Shop All
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white flex flex-col justify-between font-helvetica">
      <div>
        <Header />

        <div className="mx-auto max-w-360 px-4 sm:px-8 pt-24 sm:pt-32 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Section: Thumbnails + Main Image Viewer */}
            <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4 items-start">
              
              {/* Vertical Thumbnail List */}
              <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto max-h-[35rem] shrink-0 sm:w-20 w-full pr-0 sm:pr-1 pb-2 sm:pb-0 scroll-smooth">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    id={`storefront-thumb-${idx}`}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 aspect-square shrink-0 bg-white overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? "border-black ring-2 ring-black/10 scale-100"
                        : "border-transparent opacity-60 hover:opacity-100 hover:border-neutral-300"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover object-center"
                    />
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 bg-black/80 text-white text-[8px] font-bold px-1 py-0.2 rounded">
                        Main
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Main Active Photo Viewer (4:3 Portrait Orientation) */}
              <div 
                className="relative flex-1 aspect-[3/4] w-full bg-white overflow-hidden rounded-2xl cursor-zoom-in group select-none"
                onClick={() => setLightboxIndex(activeImageIndex)}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {productImages.map((img, idx) => {
                  const isActive = activeImageIndex === idx;
                  return (
                    <div
                      key={`${img}-${idx}`}
                      className={`absolute inset-0 transition-opacity duration-200 ease-out ${
                        isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.title} photo ${idx + 1}`}
                        fill
                        priority={idx === 0 || idx === 1}
                        loading={idx < 3 ? "eager" : "lazy"}
                        sizes="(max-width: 1024px) 100vw, 45vw"
                        className="object-cover object-center"
                      />
                    </div>
                  );
                })}

                {/* Bottom Right Circular Navigation Arrows */}
                {productImages.length > 1 && (
                  <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                      aria-label="Previous image"
                      className="w-11 h-11 rounded-full bg-white/90 hover:bg-white text-neutral-900 shadow-md flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-90 hover:scale-105 backdrop-blur-xs"
                    >
                      <ChevronLeft className="h-5 w-5 stroke-2" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                      aria-label="Next image"
                      className="w-11 h-11 rounded-full bg-white/90 hover:bg-white text-neutral-900 shadow-md flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-90 hover:scale-105 backdrop-blur-xs"
                    >
                      <ChevronRight className="h-5 w-5 stroke-2" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Sticky Product Info Sidebar */}
            <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6 pt-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight leading-tight">
                  {product.title}
                </h1>
                <p className="text-base sm:text-lg font-medium text-neutral-900 mt-2">
                  {product.priceFormatted}
                </p>
              </div>

              {/* Copy Order Details Button */}
              <div>
                <button
                  onClick={handleCopyOrderDetails}
                  className="w-full flex items-center justify-center gap-2.5 py-4 bg-black text-white text-xs sm:text-sm font-medium rounded-xl hover:bg-neutral-800 transition-all cursor-pointer shadow-sm"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400 stroke-[2.5]" />
                      <span>Copied Order Details!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 stroke-2" />
                      <span>Copy Order Details</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-neutral-500 text-center mt-2">
                  Click to copy order details. Paste directly into our Facebook chat!
                </p>
              </div>

              {/* Expanded Thrift Specifications */}
              <div className="space-y-2 text-xs sm:text-sm text-neutral-700 font-normal pt-2 border-t border-neutral-100">
                <p><span className="font-semibold text-neutral-900">Tag Size:</span> {product.tagSize || "N/A"}</p>
                <p><span className="font-semibold text-neutral-900">Measurements:</span> {formattedMeasurements}</p>
                <p><span className="font-semibold text-neutral-900">Condition:</span> {product.condition || "N/A"}</p>
                {Boolean(product.issue || product.measurementsData?.issue) && (
                  <p><span className="font-semibold text-neutral-900">Issue:</span> {product.issue || product.measurementsData?.issue}</p>
                )}
                {Boolean(product.modelHeight || product.measurementsData?.modelHeight || product.modelWeight || product.measurementsData?.modelWeight) && (
                  <p>
                    <span className="font-semibold text-neutral-900">Model:</span>{" "}
                    {[
                      (product.modelHeight || product.measurementsData?.modelHeight)?.trim()
                        ? `Height: ${(product.modelHeight || product.measurementsData?.modelHeight)?.trim()}`
                        : "",
                      (product.modelWeight || product.measurementsData?.modelWeight)?.trim()
                        ? `Weight: ${(product.modelWeight || product.measurementsData?.modelWeight)?.trim()}kg`
                        : "",
                    ].filter(Boolean).join(" | ")}
                  </p>
                )}
              </div>

              {/* Highlighted How To Order Block */}
              <div className="bg-neutral-50 border border-neutral-200 p-5 rounded-lg space-y-3">
                <div className="font-bold text-xs tracking-wider uppercase text-black flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 stroke-[2]" />
                  <span>HOW TO ORDER</span>
                </div>

                <ol className="space-y-2 text-xs sm:text-sm text-neutral-800 leading-relaxed font-normal">
                  <li className="flex items-start gap-2">
                    <span className="font-bold">1.</span>
                    <span>Click <b>Copy Order Details</b> above.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">2.</span>
                    <span>
                      Paste it into our Facebook page chat:{" "}
                      <a 
                        href="https://www.facebook.com/people/Grail-Society/100075987014852/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-bold underline text-black hover:text-neutral-600"
                      >
                        Grail Society
                      </a>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">3.</span>
                    <span>Our team will assist you with checkout.</span>
                  </li>
                </ol>

                <div className="text-xs text-neutral-900 font-semibold pt-2 flex items-center gap-2 mt-2">
                  <Gift className="h-4 w-4 stroke-[2]" />
                  <span>Bonus: FREE shipping on every item!</span>
                </div>
              </div>

            </div>

          </div>

          {/* You May Also Like Section */}
          {suggestedProducts.length > 0 && (
            <div className="mt-16 pt-8 border-t border-neutral-100">
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight mb-8">
                You may also like
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
                {suggestedProducts.map((item) => (
                  <Link key={item.id} href={`/products/${item.id}`} className="group cursor-pointer">
                    <div className="relative aspect-square w-full bg-white overflow-hidden rounded-none mb-3">
                      <Image
                        src={item.images?.[0] || "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9"}
                        alt={item.title}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className={`object-cover object-center transition-all duration-200 ease-out group-hover:scale-105 ${
                          item.images && item.images.length > 1 ? "group-hover:opacity-0" : ""
                        }`}
                      />
                      {item.images && item.images.length > 1 && (
                        <Image
                          src={item.images[1]}
                          alt={`${item.title} alternate view`}
                          fill
                          unoptimized
                          sizes="(max-width: 640px) 50vw, 25vw"
                          className="object-cover object-center opacity-0 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <h3 className="text-xs sm:text-sm font-normal text-neutral-800 line-clamp-2 leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm font-medium text-neutral-900 mt-1">
                      {item.priceFormatted}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= FULLSCREEN SCROLLABLE GALLERY MODAL (Full Bleed, Desktop Right Rail, Mobile Bottom Strip) ================= */}
      {lightboxIndex !== null && (
        <div 
          ref={lightboxContainerRef}
          className="fixed inset-0 z-100 bg-white overflow-y-auto overflow-x-hidden font-helvetica select-none animate-in fade-in duration-200"
        >
          {/* Top Right: Clean Circular Close Button */}
          <button
            onClick={() => setLightboxIndex(null)}
            aria-label="Close Full View"
            className="fixed top-3.5 right-3.5 sm:top-5 sm:right-6 z-50 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white text-neutral-900 shadow-md border border-neutral-200/80 flex items-center justify-center transition-all cursor-pointer backdrop-blur-md hover:scale-105"
          >
            <X className="h-5 w-5 stroke-[1.75]" />
          </button>

          {/* Desktop Right-Side Vertical Thumbnails Rail */}
          {productImages.length > 1 && (
            <div className="hidden sm:flex fixed right-4 sm:right-6 top-20 bottom-6 z-40 flex-col gap-2 sm:gap-2.5 overflow-y-auto no-scrollbar py-2 px-1 max-h-[calc(100vh-6.5rem)]">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const el = document.getElementById(`lightbox-img-${idx}`);
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                  aria-label={`Jump to photo ${idx + 1}`}
                  className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xs overflow-hidden border-2 transition-all cursor-pointer shrink-0 shadow-2xs ${
                    activeScrollIndex === idx
                      ? "border-black scale-105 opacity-100 ring-2 ring-black/20"
                      : "border-neutral-200/80 opacity-60 hover:opacity-100 bg-white"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Thumb ${idx + 1}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Mobile Bottom Horizontal Thumbnails Strip */}
          {productImages.length > 1 && (
            <div className="flex sm:hidden fixed bottom-3 inset-x-0 z-40 items-center justify-start gap-1.5 px-3 overflow-x-auto no-scrollbar py-1">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  id={`mobile-thumb-${idx}`}
                  onClick={() => {
                    const el = document.getElementById(`lightbox-img-${idx}`);
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                  aria-label={`Jump to photo ${idx + 1}`}
                  className={`relative w-11 h-11 rounded-xs overflow-hidden border-2 transition-all cursor-pointer shrink-0 shadow-2xs ${
                    activeScrollIndex === idx
                      ? "border-black scale-105 opacity-100 ring-2 ring-black/20"
                      : "border-neutral-200/80 opacity-60 hover:opacity-100 bg-white"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Thumb ${idx + 1}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Vertically Stacked Full-Bleed Images Feed */}
          <div className="w-full flex flex-col items-center pt-0 pb-16 sm:pb-8 sm:pr-24">
            <div className="w-full max-w-6xl flex flex-col items-center gap-0">
              {productImages.map((img, idx) => (
                <div
                  key={idx}
                  id={`lightbox-img-${idx}`}
                  data-index={idx}
                  className="lightbox-scroll-item relative w-full aspect-square md:h-[96vh] md:max-w-5xl bg-white overflow-hidden flex items-center justify-center"
                >
                  <Image
                    src={img}
                    alt={`${product.title} photo ${idx + 1}`}
                    fill
                    unoptimized
                    priority={idx === 0 || idx === lightboxIndex}
                    className="object-contain object-center"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}