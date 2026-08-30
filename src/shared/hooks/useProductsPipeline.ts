import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "@/shared/config/api";

export interface ProductItem {
  id?: string;
  name: string;
  brand: string;
  price: string;
  category: string;
  description: string;
  stock: number;
}

const PRODUCTS_QUERY_KEY = ["products"];

const fetchProducts = async (
  storeId: string | null,
): Promise<ProductItem[]> => {
  if (!storeId) return [];

  const token = localStorage.getItem("token");
  const response = await fetch(
    `${API_BASE_URL}/api/v1/products?storeId=${storeId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (!response.ok) throw new Error("Failed to pull live catalog listings.");

  const envelope = await response.json();
  const rawList = envelope.data || [];

  return rawList.map((prod: any) => ({
    id: prod.id,
    name: prod.name,
    brand: prod.brand || "",
    price: prod.price.toString(),
    category: prod.category?.name || "Electronics",
    description: prod.description || "",
    stock: prod.inventory?.[0]?.quantityOnHand || 0,
  }));
};

export const useProductsPipeline = (
  storeId: string | null,
  onMutationSuccess?: () => void,
) => {
  const queryClient = useQueryClient();

  const query = useQuery<ProductItem[], Error>({
    queryKey: [...PRODUCTS_QUERY_KEY, storeId],
    queryFn: () => fetchProducts(storeId),
    staleTime: 10000,
    enabled: Boolean(storeId),
  });

  const addProductMutation = useMutation({
    mutationFn: async (newProduct: ProductItem): Promise<ProductItem> => {
      if (!storeId) throw new Error("No active store branch selected.");

      const token = localStorage.getItem("token");

      // 1. Fetch categories from backend to resolve name to ID
      const catRes = await fetch(`${API_BASE_URL}/api/v1/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!catRes.ok)
        throw new Error("Failed to resolve category list from backend.");
      const catEnvelope = await catRes.json();
      const categoriesList = catEnvelope.data || [];

      // 2. Map frontend dropdown category to seeded database category name
      const categoryNameMap: Record<string, string> = {
        Electronics: "Electronics",
        Apparel: "Shopping & Retail",
        "Home & Kitchen": "Home & Living",
        Groceries: "Food & Beverage",
      };

      const targetName = categoryNameMap[newProduct.category] || "Electronics";
      const matchedCategory = categoriesList.find(
        (c: any) => c.name.toLowerCase() === targetName.toLowerCase(),
      );

      const categoryId = matchedCategory?.id || categoriesList[0]?.id;
      if (!categoryId) {
        throw new Error(
          "No category ID matches. Ensure database categories are seeded.",
        );
      }

      // 3. Post to backend to create the product
      const response = await fetch(`${API_BASE_URL}/api/v1/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          storeId,
          name: newProduct.name,
          price: Number(newProduct.price),
          brand: newProduct.brand,
          description: newProduct.description,
          categoryId,
          isActive: true,
          initialStock: newProduct.stock || 0,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(
          errorBody?.message ||
            "Catalog mutation rejected by validation rules.",
        );
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...PRODUCTS_QUERY_KEY, storeId],
      });
      if (onMutationSuccess) onMutationSuccess();
    },
  });

  return {
    products: query.data ?? ([] as ProductItem[]),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    addProduct: addProductMutation.mutateAsync,
    isAdding: addProductMutation.isPending,
  };
};
