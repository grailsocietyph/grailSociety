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
  };
  condition: string;
  modelHeightFt: string;
  modelHeightIn: string;
  modelWeightKg: string;
  images: string[];
  isNewArrival: boolean;
  status: "draft" | "published";
  isSoldOut?: boolean;
  dateAdded: string;
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
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
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
        setProducts(mapped);
        if (typeof window !== "undefined") {
          localStorage.setItem("grail_society_products_cache", JSON.stringify(mapped));
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
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("grail_society_products_cache");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProducts(parsed);
          }
        } catch (e) {
          console.error("Failed to parse cached products", e);
        }
      }
    }

    fetchProducts();

    // Supabase Realtime Subscription for automatic multi-tab/device syncing
    const channel = supabase
      .channel("public:products")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newProd = mapDbProductToProduct(payload.new as DbProduct);
            setProducts((prev) => [newProd, ...prev.filter((p) => p.id !== newProd.id)]);
          } else if (payload.eventType === "UPDATE") {
            const updatedProd = mapDbProductToProduct(payload.new as DbProduct);
            setProducts((prev) =>
              prev.map((p) => (p.id === updatedProd.id ? updatedProd : p))
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
    setProducts((prev) => [productWithId, ...prev]);

    try {
      const dbPayload = mapProductToDbProduct(productWithId);
      const { data, error: insertError } = await supabase
        .from("products")
        .insert([dbPayload])
        .select()
        .single();

      if (insertError) {
        console.error("Supabase insert error:", insertError);
        return productWithId;
      }

      if (data) {
        const savedProduct = mapDbProductToProduct(data as DbProduct);
        setProducts((prev) => prev.map((p) => (p.id === tempId ? savedProduct : p)));
        return savedProduct;
      }
      return productWithId;
    } catch (err) {
      console.error("Failed to add product to Supabase:", err);
      return productWithId;
    }
  };

  const updateProduct = async (id: string, updatedFields: Partial<Product>): Promise<boolean> => {
    // Optimistic state update
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );

    try {
      const dbPayload = mapProductToDbProduct(updatedFields);
      const { error: updateError } = await supabase
        .from("products")
        .update(dbPayload)
        .eq("id", id);

      if (updateError) {
        console.error("Supabase update error:", updateError);
        return false;
      }
      return true;
    } catch (err) {
      console.error("Failed to update product in Supabase:", err);
      return false;
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    // Optimistic state update
    setProducts((prev) => prev.filter((p) => p.id !== id));

    try {
      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (deleteError) {
        console.error("Supabase delete error:", deleteError);
        return false;
      }
      return true;
    } catch (err) {
      console.error("Failed to delete product from Supabase:", err);
      return false;
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
    setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));

    try {
      const { error: bulkError } = await supabase
        .from("products")
        .delete()
        .in("id", ids);

      if (bulkError) {
        console.error("Supabase bulk delete error:", bulkError);
        return false;
      }
      return true;
    } catch (err) {
      console.error("Failed bulk delete in Supabase:", err);
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