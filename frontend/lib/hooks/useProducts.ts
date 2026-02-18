"use client";

import { useState, useEffect } from 'react';
import { productAPI } from '../api';

interface UseProductsOptions {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  size?: string;
  purpose?: string;
  sort?: string;
  /** When provided, uses server-side search instead of getAll + filters */
  search?: string;
}

export function useProducts(options?: UseProductsOptions) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);
        // Always use getAll so category, purpose, and other filters apply.
        // Optional q (search) is combined with filters on the backend.
        const { search, ...rest } = options ?? {};
        const params = {
          ...rest,
          ...(search?.trim() ? { q: search.trim() } : {}),
        };
        const response = await productAPI.getAll(params);
        if (response.status === 'success') {
          setProducts(response.data?.products ?? []);
          setPagination(response.data?.pagination ?? null);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [JSON.stringify(options)]);

  return { products, loading, error, pagination };
}

export function useFeaturedProducts(limit: number = 8) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        setLoading(true);
        setError(null);
        const response = await productAPI.getFeatured(limit);
        
        if (response.status === 'success') {
          setProducts(response.data.products);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch featured products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedProducts();
  }, [limit]);

  return { products, loading, error };
}

export function usePromotions(limit: number = 8) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPromotions() {
      try {
        setLoading(true);
        setError(null);
        const response = await productAPI.getPromotions(limit);
        
        if (response.status === 'success') {
          setProducts(response.data.products);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch promotions');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPromotions();
  }, [limit]);

  return { products, loading, error };
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchProduct() {
      try {
        setLoading(true);
        setError(null);
        const response = await productAPI.getById(id);
        
        if (response.status === 'success') {
          setProduct(response.data.product);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch product');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  return { product, loading, error };
}
