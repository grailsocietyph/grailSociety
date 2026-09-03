export const CATEGORY_LABELS: Record<string, string> = {
  "t-shirts": "T-shirts and Polos",
  "sweaters": "Sweaters and Long Sleeves",
  "hoodies": "Hoodies",
  "jackets": "Jackets",
  "shorts": "Shorts",
  "pants": "Pants",
  "bags": "Bags",
  "accessories": "Accessories",
  "shoes": "Shoes",
};

export function getCategoryLabel(slug: string): string {
  if (!slug) return "";
  const normalized = slug.toLowerCase().trim();
  if (CATEGORY_LABELS[normalized]) return CATEGORY_LABELS[normalized];
  if (normalized === "t-shirts-and-polos" || normalized === "tshirts-and-polos") return "T-shirts and Polos";
  if (normalized === "sweaters-and-long-sleeves") return "Sweaters and Long Sleeves";
  return normalized
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
