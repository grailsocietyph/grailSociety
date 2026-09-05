"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase, mapDbProductToProduct, mapProductToDbProduct, DbProduct } from "@/lib/supabase";

export interface Product {
  id: string;
  title: string;
  priceNum: number;
  priceFormatted: string;
  collectionSlug: string;
  tagSize: string;
  measurementsData: {
    length?: string;
    width?: string;
    waist?: string;
    legOpening?: string;
    notes?: string;
    issue?: string;
    modelHeight?: string;
    modelWeight?: string;
  };
  condition: string;
  issue?: string;
  modelHeight?: string;
  modelWeight?: string;
  images: string[];
  isNewArrival: boolean;
  status: "draft" | "published";
  isSoldOut?: boolean;
  dateAdded: string;
  displayOrder?: number;
}

export function sortProducts(items: Product[]): Product[] {
  return [...items].sort((a, b) => {
    const orderA = a.displayOrder && a.displayOrder > 0 ? a.displayOrder : Infinity;
    const orderB = b.displayOrder && b.displayOrder > 0 ? b.displayOrder : Infinity;

    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return new Date(b.dateAdded || 0).getTime() - new Date(a.dateAdded || 0).getTime();
  });
}

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  addProduct: (product: Omit<Product, "id">) => Promise<Product | null>;
  updateProduct: (id: string, updatedProduct: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  bulkPublish: (ids: string[]) => Promise<boolean>;
  bulkDraft: (ids: string[]) => Promise<boolean>;
  bulkDelete: (ids: string[]) => Promise<boolean>;
  reorderProducts: (orderedIds: string[]) => Promise<boolean>;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

async function deleteImagesFromR2(imageUrls: string[]) {
  if (!imageUrls || imageUrls.length === 0) return;
  // Target only product images stored in R2
  const targets = imageUrls.filter(
    (url) => typeof url === "string" && (url.includes("products/") || url.startsWith("products/"))
  );
  if (targets.length === 0) return;

  try {
    await fetch("/api/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls: targets }),
    });
  } catch (err) {
    console.warn("Failed to delete images from Cloudflare R2:", err);
  }
}

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("grail_society_products_cache");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn("Failed to parse cached products", e);
      }
    }
    return [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (isInitial = false) => {
    try {
      if (isInitial && products.length === 0) {
        setLoading(true);
      }
      setError(null);

      const { data, error: sbError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (sbError) {
        console.warn("Supabase query error:", sbError.message);
        setError(sbError.message);
        return;
      }

      if (data && data.length > 0) {
        const mapped = data.map((item: DbProduct) => mapDbProductToProduct(item));
        const sorted = sortProducts(mapped);
        setProducts(sorted);
        if (typeof window !== "undefined") {
          localStorage.setItem("grail_society_products_cache", JSON.stringify(sorted));
        }
      } else {
        setProducts([]);
        if (typeof window !== "undefined") {
          localStorage.setItem("grail_society_products_cache", JSON.stringify([]));
        }
      }
    } catch (err: any) {
      console.error("Error fetching products from Supabase:", err);
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [products.length]);

  useEffect(() => {
    fetchProducts(true);

    // Supabase Realtime Subscription for automatic multi-tab/device syncing
    const channel = supabase
      .channel("public:products")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newProd = mapDbProductToProduct(payload.new as DbProduct);
            setProducts((prev) => sortProducts([newProd, ...prev.filter((p) => p.id !== newProd.id)]));
          } else if (payload.eventType === "UPDATE") {
            const updatedProd = mapDbProductToProduct(payload.new as DbProduct);
            setProducts((prev) =>
              sortProducts(prev.map((p) => (p.id === updatedProd.id ? updatedProd : p)))
            );
          } else if (payload.eventType === "DELETE") {
            const deletedId = (payload.old as any).id;
            if (deletedId) {
              setProducts((prev) => prev.filter((p) => p.id !== deletedId));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProducts]);

  // Persist locally for instant offline UI rendering
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem("grail_society_products_cache", JSON.stringify(products));
    }
  }, [products]);

  const addProduct = async (newProd: Omit<Product, "id">): Promise<Product | null> => {
    const tempId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
    const productWithId: Product = { ...newProd, id: tempId };

    // Optimistic state update
    setProducts((prev) => sortProducts([productWithId, ...prev]));

    try {
      const dbPayload = mapProductToDbProduct(productWithId);
      const { data, error: insertError } = await supabase
        .from("products")
        .insert([dbPayload])
        .select()
        .single();

      if (insertError) {
        console.error("Supabase insert error:", insertError);
        setProducts((prev) => prev.filter((p) => p.id !== tempId));
        throw new Error(insertError.message);
      }

      if (data) {
        const savedProduct = mapDbProductToProduct(data as DbProduct);
        setProducts((prev) => sortProducts(prev.map((p) => (p.id === tempId ? savedProduct : p))));
        return savedProduct;
      }
      return productWithId;
    } catch (err: any) {
      console.error("Failed to add product to Supabase:", err);
      setProducts((prev) => prev.filter((p) => p.id !== tempId));
      throw err;
    }
  };

  const updateProduct = async (id: string, updatedFields: Partial<Product>): Promise<boolean> => {
    const previous = products.find((p) => p.id === id);

    // Optimistic state update
    setProducts((prev) =>
      sortProducts(prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p)))
    );

    try {
      const dbPayload = mapProductToDbProduct(updatedFields);
      const { error: updateError } = await supabase
        .from("products")
        .update(dbPayload)
        .eq("id", id);

      if (updateError) {
        console.error("Supabase update error:", updateError);
        if (previous) {
          setProducts((prev) => prev.map((p) => (p.id === id ? previous : p)));
        }
        throw new Error(updateError.message);
      }

      // If images were updated, delete removed images from Cloudflare R2
      if (previous?.images && updatedFields.images) {
        const remaining = new Set(updatedFields.images);
        const removed = previous.images.filter((img) => !remaining.has(img));
        if (removed.length > 0) {
          deleteImagesFromR2(removed);
        }
      }

      return true;
    } catch (err: any) {
      console.error("Failed to update product in Supabase:", err);
      if (previous) {
        setProducts((prev) => prev.map((p) => (p.id === id ? previous : p)));
      }
      throw err;
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    const previous = products.find((p) => p.id === id);

    // Optimistic state update
    setProducts((prev) => prev.filter((p) => p.id !== id));

    try {
      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (deleteError) {
        console.error("Supabase delete error:", deleteError);
        if (previous) {
          setProducts((prev) => [previous, ...prev]);
        }
        throw new Error(deleteError.message);
      }

      // Cleanup image files from Cloudflare R2 storage
      if (previous?.images && previous.images.length > 0) {
        deleteImagesFromR2(previous.images);
      }

      return true;
    } catch (err: any) {
      console.error("Failed to delete product from Supabase:", err);
      if (previous) {
        setProducts((prev) => [previous, ...prev]);
      }
      throw err;
    }
  };

  const bulkPublish = async (ids: string[]): Promise<boolean> => {
    setProducts((prev) =>
      prev.map((p) => (ids.includes(p.id) ? { ...p, status: "published" } : p))
    );

    try {
      const { error: bulkError } = await supabase
        .from("products")
        .update({ status: "published" })
        .in("id", ids);

      if (bulkError) {
        console.error("Supabase bulk publish error:", bulkError);
        return false;
      }
      return true;
    } catch (err) {
      console.error("Failed bulk publish in Supabase:", err);
      return false;
    }
  };

  const bulkDraft = async (ids: string[]): Promise<boolean> => {
    setProducts((prev) =>
      prev.map((p) => (ids.includes(p.id) ? { ...p, status: "draft" } : p))
    );

    try {
      const { error: bulkError } = await supabase
        .from("products")
        .update({ status: "draft" })
        .in("id", ids);

      if (bulkError) {
        console.error("Supabase bulk draft error:", bulkError);
        return false;
      }
      return true;
    } catch (err) {
      console.error("Failed bulk draft in Supabase:", err);
      return false;
    }
  };

  const bulkDelete = async (ids: string[]): Promise<boolean> => {
    const targets = products.filter((p) => ids.includes(p.id));
    const previous = [...products];

    setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));

    try {
      const { error: bulkError } = await supabase
        .from("products")
        .delete()
        .in("id", ids);

      if (bulkError) {
        console.error("Supabase bulk delete error:", bulkError);
        setProducts(previous);
        return false;
      }

      // Cleanup all image files across deleted products from Cloudflare R2 storage
      const allImages = targets.flatMap((p) => p.images || []);
      if (allImages.length > 0) {
        deleteImagesFromR2(allImages);
      }

      return true;
    } catch (err) {
      console.error("Failed bulk delete in Supabase:", err);
      setProducts(previous);
      return false;
    }
  };

  const reorderProducts = async (orderedIds: string[]): Promise<boolean> => {
    const orderMap = new Map(orderedIds.map((id, index) => [id, index + 1]));

    // Optimistic state update
    setProducts((prev) => {
      const updated = prev.map((p) => {
        if (orderMap.has(p.id)) {
          return { ...p, displayOrder: orderMap.get(p.id)! };
        }
        return p;
      });
      return sortProducts(updated);
    });

    try {
      const updates = orderedIds.map((id, index) =>
        supabase
          .from("products")
          .update({ display_order: index + 1 })
          .eq("id", id)
      );

      const results = await Promise.all(updates);
      const anyError = results.find((r) => r.error);
      if (anyError && anyError.error) {
        console.warn("Supabase batch reorder note:", anyError.error.message);
      }
      return true;
    } catch (err) {
      console.error("Failed to update product order:", err);
      return false;
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        error,
        addProduct,
        updateProduct,
        deleteProduct,
        bulkPublish,
        bulkDraft,
        bulkDelete,
        reorderProducts,
        refreshProducts: fetchProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) throw new Error("useProducts must be used within a ProductProvider");
  return context;
}