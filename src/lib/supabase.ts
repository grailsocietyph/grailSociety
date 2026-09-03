import { createClient } from "@supabase/supabase-js";
import { Product } from "@/context/ProductContext";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase environment variables are missing. Please check .env.local");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface DbProduct {
  id: string;
  title: string;
  price_num: number;
  price_formatted: string;
  collection_slug: string;
  tag_size: string;
  measurements_data: Record<string, string | undefined>;
  condition: string;
  images: string[];
  is_new_arrival: boolean;
  status: "draft" | "published";
  is_sold_out: boolean;
  date_added: string;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export function mapDbProductToProduct(row: DbProduct): Product {
  const measurements = (row.measurements_data as Record<string, string | undefined>) || {};
  const issue = (measurements.issue as string) || (row as any).issue || "";
  return {
    id: row.id,
    title: row.title,
    priceNum: Number(row.price_num) || 0,
    priceFormatted: row.price_formatted,
    collectionSlug: row.collection_slug || "t-shirts",
    tagSize: row.tag_size || "M",
    measurementsData: {
      ...measurements,
      issue: issue || undefined,
    },
    condition: row.condition || "",
    issue: issue || undefined,
    images: Array.isArray(row.images) ? row.images : [],
    isNewArrival: Boolean(row.is_new_arrival),
    status: (row.status as "draft" | "published") || "draft",
    isSoldOut: Boolean(row.is_sold_out),
    dateAdded: row.date_added || new Date().toISOString().split("T")[0],
    displayOrder: row.display_order !== undefined && row.display_order !== null ? Number(row.display_order) : 0,
  };
}

export function mapProductToDbProduct(product: Partial<Product>): Partial<DbProduct> {
  const dbItem: Partial<DbProduct> = {};

  if (product.id !== undefined) dbItem.id = product.id;
  if (product.title !== undefined) dbItem.title = product.title;
  if (product.priceNum !== undefined) dbItem.price_num = product.priceNum;
  if (product.priceFormatted !== undefined) dbItem.price_formatted = product.priceFormatted;
  if (product.collectionSlug !== undefined) dbItem.collection_slug = product.collectionSlug;
  if (product.tagSize !== undefined) dbItem.tag_size = product.tagSize;
  if (product.measurementsData !== undefined || product.issue !== undefined) {
    dbItem.measurements_data = {
      ...(product.measurementsData || {}),
      issue: product.issue || product.measurementsData?.issue || undefined,
    };
  }
  if (product.condition !== undefined) dbItem.condition = product.condition;
  if (product.images !== undefined) dbItem.images = product.images;
  if (product.isNewArrival !== undefined) dbItem.is_new_arrival = product.isNewArrival;
  if (product.status !== undefined) dbItem.status = product.status;
  if (product.isSoldOut !== undefined) dbItem.is_sold_out = product.isSoldOut;
  if (product.dateAdded !== undefined) dbItem.date_added = product.dateAdded;
  if (product.displayOrder !== undefined) dbItem.display_order = product.displayOrder;

  return dbItem;
}
