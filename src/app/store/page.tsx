// Server Component — no "use client"
// Products are fetched directly from Supabase at request time.
// No loading flash — HTML arrives with products already included.

import { createClient } from "@/utils/supabase/server";
import StoreClient from "./StoreClient";

export const revalidate = 30; // ISR — revalidate cached page every 30s

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  in_stock: boolean;
  sizes?: string[];
  tag?: string;
  featured?: boolean;
}

async function fetchProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: true });
    if (error || !data) return [];
    return data as Product[];
  } catch {
    return [];
  }
}

export default async function StorePage() {
  const products = await fetchProducts();

  return <StoreClient initialProducts={products} />;
}
