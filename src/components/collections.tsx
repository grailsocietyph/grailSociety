"use client";

import Image from "next/image";
import Link from "next/link";

interface CollectionItem {
  id: string;
  title: string;
  slug: string;
  image: string;
}

const COLLECTIONS: CollectionItem[] = [
  { id: "1", title: "T-shirts", slug: "t-shirts", image: "/collections/t-shirts.jpg" },
  { id: "2", title: "Hoodies", slug: "hoodies", image: "/collections/hoodies.jpg" },
  { id: "3", title: "Shorts", slug: "shorts", image: "/collections/shorts.jpg" },
  { id: "4", title: "Pants", slug: "pants", image: "/collections/pants.jpg" },
  { id: "5", title: "Sweaters", slug: "sweaters", image: "/collections/sweaters.jpg" },
  { id: "6", title: "Jackets", slug: "jackets", image: "/collections/jackets.jpg" },
  { id: "7", title: "Bags", slug: "bags", image: "/collections/bags.jpg" },
  { id: "8", title: "Accessories", slug: "accessories", image: "/collections/accessories.jpg" },
  { id: "9", title: "Shoes", slug: "shoes", image: "/collections/shoes.jpg" },
];

export default function Collections() {
  return (
    <section className="mx-auto max-w-360 px-4 sm:px-8 py-12 sm:py-16 font-helvetica">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight">
          Collections
        </h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {COLLECTIONS.map((item) => (
          <Link
            key={item.id}
            href={`/collections/${item.slug}`}
            className="group flex flex-col cursor-pointer"
          >
            <span className="text-xs sm:text-sm font-normal text-neutral-800 mb-2 transition-colors group-hover:text-black">
              {item.title}
            </span>

            <div className="relative aspect-square w-full overflow-hidden bg-white rounded-none">
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-contain object-center p-2 transition-transform duration-200 ease-out group-hover:scale-105"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}