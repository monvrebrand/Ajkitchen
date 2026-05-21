export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  images: string[];
  description: string;
  details: string[];
  sizes: string[];
  tag?: string;
  featured?: boolean;
}

export const products: Product[] = [
  {
    id: "series-01-tshirt",
    name: "Series 01 Tech Tee",
    price: 145,
    category: "Tops",
    image: "/products/tshirt.png",
    images: ["/products/tshirt.png"],
    description: "The centrepiece of Series 01. Heavy-weight 340gsm cotton with a precision screen-print graphic dissected across front and back panels.",
    details: [
      "340gsm heavyweight cotton",
      "Oversized boxy fit",
      "Screen-print ink graphic front & back",
      "Ribbed crewneck",
      "Made in Portugal",
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    tag: "Series 01",
    featured: true,
  },
  {
    id: "monvre-hoodie",
    name: "Void Hoodie",
    price: 220,
    category: "Tops",
    image: "/products/hoodie.png",
    images: ["/products/hoodie.png"],
    description: "500gsm double-faced fleece with dropped shoulders and an oversized silhouette. The ultimate winter layer from MONVRE.",
    details: [
      "500gsm double-faced fleece",
      "Dropped shoulder construction",
      "Embroidered MONVRE wordmark",
      "Kangaroo pocket",
      "Made in Portugal",
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    featured: true,
  },
  {
    id: "tactical-cargo",
    name: "Tactical Cargo Pant",
    price: 310,
    category: "Bottoms",
    image: "/products/cargo.png",
    images: ["/products/cargo.png"],
    description: "Six-pocket cargo silhouette reimagined for the urban environment. Ripstop fabric with adjustable ankle cuffs.",
    details: [
      "100% ripstop nylon",
      "Six-pocket construction",
      "Adjustable ankle cuffs",
      "YKK zippers throughout",
      "Made in Japan",
    ],
    sizes: ["28", "30", "32", "34", "36"],
    featured: true,
  },
  {
    id: "monvre-cap",
    name: "Void Structured Cap",
    price: 85,
    category: "Accessories",
    image: "/products/cap.png",
    images: ["/products/cap.png"],
    description: "Six-panel structured cap with front MONVRE embroidery. Premium wool-blend with a curved brim.",
    details: [
      "Wool-blend structured front",
      "Embroidered MONVRE logo",
      "Adjustable snapback closure",
      "One size fits most",
      "Made in Korea",
    ],
    sizes: ["One Size"],
    tag: "New",
  },
  {
    id: "monvre-jacket",
    name: "Series 01 Bomber",
    price: 490,
    category: "Outerwear",
    image: "/products/jacket.png",
    images: ["/products/jacket.png"],
    description: "MA-1 silhouette reimagined with a technical nylon shell, contrast interior lining, and embroidered MONVRE branding.",
    details: [
      "100% nylon shell",
      "Contrast satin interior",
      "Embroidered chest patch",
      "Rib-knit collar, cuffs and hem",
      "Made in Japan",
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    tag: "Limited",
    featured: true,
  },
  {
    id: "monvre-bag",
    name: "Urban Crossbody",
    price: 195,
    category: "Accessories",
    image: "/products/bag.png",
    images: ["/products/bag.png"],
    description: "Minimal crossbody bag in ballistic nylon with debossed MONVRE branding and a water-resistant zip.",
    details: [
      "1000D ballistic nylon",
      "Debossed MONVRE hardware",
      "Water-resistant zip",
      "Adjustable strap up to 55cm drop",
      "Made in Korea",
    ],
    sizes: ["One Size"],
  },
];

export const categories = ["All", "Tops", "Bottoms", "Outerwear", "Accessories"];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  if (category === "All") return products;
  return products.filter((p) => p.category === category);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}
