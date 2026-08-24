"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "1",
    title: "Arc'teryx Grotto Toque Beanie in Carob/Canvas",
    priceNum: 3900,
    priceFormatted: "₱3,900.00",
    collectionSlug: "accessories",
    tagSize: "One Size",
    measurementsData: { notes: "Standard adult beanie fit, stretchable rib knit." },
    condition: "Brand-new / Dead-stock (10/10)",
    modelHeightFt: "5",
    modelHeightIn: "8",
    modelWeightKg: "81",
    images: [
      "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=1000&auto=format&fit=crop",
    ],
    isNewArrival: true,
    status: "published",
    dateAdded: "2026-08-15",
  },
];

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, updatedProduct: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  bulkPublish: (ids: string[]) => void;
  bulkDraft: (ids: string[]) => void;
  bulkDelete: (ids: string[]) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("grail_society_local_products_v3");
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return INITIAL_PRODUCTS;
  });

  useEffect(() => {
    localStorage.setItem("grail_society_local_products_v3", JSON.stringify(products));
  }, [products]);

  const addProduct = (newProd: Omit<Product, "id">) => {
    const id = Date.now().toString();
    const productWithId: Product = { ...newProd, id };
    setProducts((prev) => [productWithId, ...prev]);
  };

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const bulkPublish = (ids: string[]) => {
    setProducts((prev) =>
      prev.map((p) => (ids.includes(p.id) ? { ...p, status: "published" } : p))
    );
  };

  const bulkDraft = (ids: string[]) => {
    setProducts((prev) =>
      prev.map((p) => (ids.includes(p.id) ? { ...p, status: "draft" } : p))
    );
  };

  const bulkDelete = (ids: string[]) => {
    setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, bulkPublish, bulkDraft, bulkDelete }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) throw new Error("useProducts must be used within a ProductProvider");
  return context;
}