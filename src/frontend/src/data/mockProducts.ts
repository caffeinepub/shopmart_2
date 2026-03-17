import { Category } from "../backend";

export interface MockProduct {
  id: bigint;
  name: string;
  description: string;
  price: bigint;
  category: Category;
  image: string;
  stock: bigint;
  isActive: boolean;
  rating: number;
  reviewCount: number;
}

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: 1n,
    name: "Floral Kurti",
    description:
      "Beautiful hand-printed floral kurti in soft cotton fabric. Perfect for casual outings and festive occasions. Available in multiple sizes.",
    price: 39900n,
    category: Category.fashion,
    image: "/assets/generated/product-kurti.dim_400x400.jpg",
    stock: 50n,
    isActive: true,
    rating: 4.5,
    reviewCount: 1284,
  },
  {
    id: 2n,
    name: "Wireless Earbuds Pro",
    description:
      "Premium wireless earbuds with 30hr battery life, active noise cancellation, and crystal-clear audio. Compatible with all Bluetooth devices.",
    price: 129900n,
    category: Category.electronics,
    image: "/assets/generated/product-earbuds.dim_400x400.jpg",
    stock: 120n,
    isActive: true,
    rating: 4.3,
    reviewCount: 876,
  },
  {
    id: 3n,
    name: "Non-stick Cookware Set",
    description:
      "Complete 5-piece non-stick cookware set with induction-compatible base. Includes kadai, tawa, and saucepan. PFOA-free coating.",
    price: 89900n,
    category: Category.homeKitchen,
    image: "/assets/generated/product-cookware.dim_400x400.jpg",
    stock: 35n,
    isActive: true,
    rating: 4.6,
    reviewCount: 2103,
  },
  {
    id: 4n,
    name: "Lipstick Combo Pack",
    description:
      "Set of 6 long-lasting matte lipsticks in bold Bollywood shades. Enriched with Vitamin E for moisturized lips all day.",
    price: 24900n,
    category: Category.beauty,
    image: "/assets/generated/product-lipstick.dim_400x400.jpg",
    stock: 200n,
    isActive: true,
    rating: 4.4,
    reviewCount: 3456,
  },
  {
    id: 5n,
    name: "Premium Yoga Mat",
    description:
      "6mm thick anti-slip yoga mat with alignment lines. Eco-friendly TPE material, sweat-resistant, with carrying strap included.",
    price: 59900n,
    category: Category.sports,
    image: "/assets/generated/product-yogamat.dim_400x400.jpg",
    stock: 75n,
    isActive: true,
    rating: 4.7,
    reviewCount: 654,
  },
  {
    id: 6n,
    name: "Kids Art Drawing Kit",
    description:
      "100-piece complete drawing kit for kids with crayons, sketch pens, watercolors, and drawing sheets. Perfect for budding little artists aged 3-12.",
    price: 19900n,
    category: Category.kids,
    image: "/assets/generated/product-drawingkit.dim_400x400.jpg",
    stock: 90n,
    isActive: true,
    rating: 4.8,
    reviewCount: 1876,
  },
];

export function formatPrice(paise: bigint): string {
  return `₹${(Number(paise) / 100).toFixed(0)}`;
}
