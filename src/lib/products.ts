// Type definitions only — all product data comes from Neon via API
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  images?: string[];
  description?: string;
  details?: string[];
  features?: string[];
  sizes?: string[];
  tag?: string;
  in_stock?: boolean;
  featured?: boolean;
}
