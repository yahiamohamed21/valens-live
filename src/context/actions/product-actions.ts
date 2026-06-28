import { useCallback, useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";
import { api } from "@/lib/api";
import { getStockStatus } from "@/lib/product-utils";
import { showToast } from "@/lib/toast";
import type { Product } from "@/types/store";

interface ProductActionDeps {
  products: Product[];
  setProducts: Dispatch<SetStateAction<Product[]>>;
}

export const useProductActions = ({ products, setProducts }: ProductActionDeps) => {
  const mapProductToUpsertDto = (prod: Partial<Product>) => {
    return {
      id: prod.id || null,
      name: prod.name,
      category: prod.category,
      description: prod.description || "",
      featured: prod.featured || false,
      bestSeller: prod.bestSeller || false,
      newArrival: prod.newArrival || false,
      visible: prod.visible !== undefined ? prod.visible : true,
      variantType: prod.variantType || "none",
      variants: prod.variants?.map((v) => ({
        id: v.id || "",
        size: v.size || "",
        flavor: v.flavor || "",
        price: Number(v.price) || 0,
        discountPrice: v.discountPrice !== undefined ? Number(v.discountPrice) : undefined,
        stockQuantity: Number(v.stockQuantity) || 0,
        sku: v.sku || "",
        image: v.image || "",
        isAvailable: v.isAvailable !== undefined ? v.isAvailable : true,
      })) || [],
      price: Number(prod.price) || 0,
      discountPrice: prod.discountPrice !== undefined ? Number(prod.discountPrice) : undefined,
      stock: Number(prod.stock) || 0,
      mainImage: prod.mainImage || "",
      images: prod.images || [],
    };
  };

  const addProduct = useCallback(async (prodData: Omit<Product, "id" | "reviews">) => {
    try {
      const dto = mapProductToUpsertDto(prodData);
      const created = await api.products.create(dto);
      
      const newProduct: Product = {
        ...prodData,
        id: created.id || `prod-${Date.now()}`,
        reviews: [],
        stockStatus: getStockStatus(created.stock !== undefined ? created.stock : prodData.stock),
      };
      setProducts((prev) => [...prev, newProduct]);
      showToast(`Product "${newProduct.name}" added`, "success");
    } catch (error: any) {
      showToast(error.message || "Failed to add product", "error");
    }
  }, [setProducts]);

  const editProduct = useCallback(async (productId: string, updatedFields: Partial<Product>) => {
    try {
      const existing = products.find((p) => p.id === productId);
      if (!existing) return;

      const isToggleOnly = Object.keys(updatedFields).length === 1 && "visible" in updatedFields;

      if (isToggleOnly) {
        await api.products.toggle(productId);
      } else {
        const merged = { ...existing, ...updatedFields };
        const dto = mapProductToUpsertDto(merged);
        await api.products.update(dto);
      }

      setProducts((prev) =>
        prev.map((prod) => {
          if (prod.id === productId) {
            const merged: Product = { ...prod, ...updatedFields };
            merged.stockStatus = getStockStatus(merged.stock);
            return merged;
          }
          return prod;
        })
      );
      showToast("Product updated successfully", "success");
    } catch (error: any) {
      showToast(error.message || "Failed to update product", "error");
    }
  }, [products, setProducts]);

  const deleteProduct = useCallback(async (productId: string) => {
    try {
      await api.products.delete(productId);
      setProducts((prev) => prev.filter((prod) => prod.id !== productId));
      showToast("Product deleted", "error");
    } catch (error: any) {
      showToast(error.message || "Failed to delete product", "error");
    }
  }, [setProducts]);

  return useMemo(
    () => ({ addProduct, editProduct, deleteProduct }),
    [addProduct, editProduct, deleteProduct]
  );
};
