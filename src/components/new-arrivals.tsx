"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useProducts, Product } from "@/context/ProductContext";

export default function NewArrivals() {
  const { products } = useProducts();

  // Filter published products marked as new arrivals, or fallback to any published products
  const publishedNewArrivals = products.filter(
    (p) => p.status === "published" && p.isNewArrival
  );
  const displayProducts = publishedNewArrivals.length > 0
    ? publishedNewArrivals
    : products.filter((p) => p.status === "published");

  if (displayProducts.length === 0) {
    return null;
  }

  const heroProduct = displayProducts[0];
  const gridProducts = displayProducts.slice(1, 5);

  return (
    <section className="mx-auto max-w-360 px-4 sm:px-8 pt-12 sm:pt-8 pb-16 font-helvetica">
      {/* Header Row matching Shop All typography */}
      <div className="flex items-center justify-between mb-8 sm:mb-10">
        <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight">
          New Arrivals
        </h1>
        <Link 
          href="/new-arrivals" 
          className="text-xs sm:text-sm font-normal text-neutral-700 hover:text-black no-underline underline-offset-4 transition-colors"
        >
          View all
        </Link>
      </div>

      {/* Balanced 3-Column Split */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-start">
        {/* Column 1: Main Feature Product */}
        {heroProduct && (
          <div className="md:col-span-1 h-full">
            <ProductCard product={heroProduct} isHero />
          </div>
        )}

        {/* Columns 2 & 3: 2x2 Secondary Products Grid */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4 sm:gap-6">
          {gridProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, isHero = false }: { product: Product; isHero?: boolean }) {
  const primaryImage = product.images?.[0] || "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9";
  const hasSecondary = product.images && product.images.length > 1;
  const secondaryImage = hasSecondary ? product.images[1] : null;

  return (
    <Link href={`/products/${product.id}`} className="w-full h-full flex flex-col justify-between group/card cursor-pointer">
      <div
        className={`relative w-full overflow-hidden bg-[#f6f6f6] rounded-none mb-2 ${
          isHero ? "h-[360px] sm:h-[420px] md:h-[calc(100%-3rem)] min-h-[380px]" : "aspect-square"
        }`}
      >
        {/* Primary Image */}
        <Image
          src={primaryImage}
          alt={product.title}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, 33vw"
          className={`object-cover object-center transition-all duration-200 ease-out group-hover/card:scale-105 ${
            hasSecondary ? "group-hover/card:opacity-0" : ""
          }`}
        />

        {/* Secondary Image (Preloaded & Fades in instantly on hover) */}
        {hasSecondary && secondaryImage && (
          <Image
            src={secondaryImage}
            alt={`${product.title} alternate view`}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover object-center opacity-0 transition-all duration-200 ease-out group-hover/card:opacity-100 group-hover/card:scale-105"
          />
        )}

        {product.isSoldOut && (
          <span className="absolute top-2 right-2 rounded-full bg-neutral-200/90 px-2.5 py-1 text-[10px] font-normal text-neutral-800 backdrop-blur-xs z-10">
            Sold out
          </span>
        )}
      </div>

      <div className="space-y-0.5">
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