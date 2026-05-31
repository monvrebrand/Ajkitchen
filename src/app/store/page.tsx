// Server Component — no "use client"
import { sql } from "@/lib/db";
import StoreClient from "./StoreClient";

export const revalidate = 30; // ISR — revalidate every 30s

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

const FOOD_CATEGORIES = ["Main Meals", "Sides", "Drinks"];

async function fetchProducts(): Promise<Product[]> {
  try {
    const data = await sql`
      SELECT * FROM products
      WHERE category = ANY(${FOOD_CATEGORIES})
      ORDER BY created_at ASC
    `;
    return data as Product[];
  } catch {
    return [];
  }
}

export default async function StorePage() {
  const products = await fetchProducts();

  return <StoreClient initialProducts={products} />;
}
