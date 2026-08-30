"use client";

import { useState, use, useEffect } from "react";
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

  const suggestedProducts = products.length > 1
    ? products.filter((p) => p.id !== product?.id).slice(0, 4)
    : products.slice(0, 4);

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

  const productImages = product.images && product.images.length > 0
    ? product.images
    : ["https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9"];

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  // Format measurements for clipboard & view
  const formattedMeasurements = product.measurementsData?.notes
    ? product.measurementsData.notes
    : [
        product.measurementsData?.length ? `Length: ${product.measurementsData.length}` : "",
        product.measurementsData?.width ? `Width: ${product.measurementsData.width}` : "",
        product.measurementsData?.waist ? `Waist: ${product.measurementsData.waist}` : "",
        product.measurementsData?.legOpening ? `Leg Opening: ${product.measurementsData.legOpening}` : "",
      ].filter(Boolean).join(" | ") || "N/A";

  const handleCopyOrderDetails = () => {
    const mainImageUrl = productImages[0] || "";
    const productUrl = typeof window !== "undefined" ? window.location.href : "";
    
    const orderText = `🛍️ ORDER INQUIRY - GRAIL SOCIETY\n\n` +
      `• Item: ${product.title}\n` +
      `• Price: ${product.priceFormatted}\n` +
      `• Tag Size: ${product.tagSize || "N/A"}\n` +
      `• Measurements: ${formattedMeasurements}\n` +
      `• Condition: ${product.condition || "N/A"}\n\n` +
      (productUrl ? `🔗 Product Link: ${productUrl}\n` : "") +
      `🖼️ Image Link: ${mainImageUrl}`;

    navigator.clipboard.writeText(orderText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  return (
    <main className="min-h-screen bg-white flex flex-col justify-between font-helvetica">
      <div>
        <Header />

        <div className="mx-auto max-w-360 px-4 sm:px-8 pt-24 sm:pt-32 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Section: Thumbnails + Main Image Viewer */}
            <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
              
              {/* Vertical Thumbnail List */}
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[35rem] shrink-0">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 bg-neutral-100 overflow-hidden rounded-none border-2 transition-all cursor-pointer ${
                      activeImageIndex === idx ? "border-black" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      unoptimized
                      className="object-cover object-center"
                    />
                  </button>
                ))}
              </div>

              {/* Main Active Photo Viewer */}
              <div 
                className="relative flex-1 aspect-square sm:h-[35rem] bg-neutral-100 overflow-hidden rounded-none cursor-zoom-in"
                onClick={() => setLightboxIndex(activeImageIndex)}
              >
                <Image
                  src={productImages[activeImageIndex] || productImages[0]}
                  alt={product.title}
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover object-center transition-transform duration-500"
                />

                {/* Bottom Right Circular Navigation Arrows */}
                {productImages.length > 1 && (
                  <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                      aria-label="Previous image"
                      className="w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center text-neutral-900 hover:bg-neutral-50 transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="h-5 w-5 stroke-2" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                      aria-label="Next image"
                      className="w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center text-neutral-900 hover:bg-neutral-50 transition-colors cursor-pointer"
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
                    <div className="relative aspect-square w-full bg-neutral-100 overflow-hidden rounded-none mb-3">
                      <Image
                        src={item.images?.[0] || "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9"}
                        alt={item.title}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
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

      {/* Fullscreen Lightbox Modal */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-100 bg-white flex items-center justify-between font-helvetica">
          <div className="relative h-full flex-1 flex items-center justify-center p-6">
            <div className="relative h-full w-full max-w-5xl">
              <Image
                src={productImages[lightboxIndex] || productImages[0]}
                alt="Fullscreen view"
                fill
                unoptimized
                className="object-contain object-center"
              />
            </div>
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-6 right-6 p-2 text-neutral-800 hover:text-black transition-colors cursor-pointer"
            >
              <X className="h-7 w-7" />
            </button>
          </div>

          <div className="h-full w-24 border-l border-neutral-100 flex flex-col items-center py-6 overflow-y-auto space-y-3 shrink-0">
            {productImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setLightboxIndex(idx)}
                className={`relative h-16 w-16 bg-neutral-100 overflow-hidden rounded-none border-2 transition-all cursor-pointer ${
                  lightboxIndex === idx ? "border-black" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <Image src={img} alt="Thumb" fill unoptimized className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}