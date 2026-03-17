import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  Baby,
  ChevronRight,
  Dumbbell,
  RefreshCcw,
  ShieldCheck,
  Shirt,
  Sparkles,
  Tag,
  Truck,
  Tv,
  UtensilsCrossed,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Category } from "../backend";
import { ProductCard } from "../components/ProductCard";
import { MOCK_PRODUCTS } from "../data/mockProducts";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddToCart,
  useListProducts,
  useProductsByCategory,
  useSearchProducts,
} from "../hooks/useQueries";

const CATEGORIES = [
  {
    label: "All",
    value: null,
    icon: Tag,
    color: "bg-pink-50 text-pink-600 border-pink-200",
  },
  {
    label: "Fashion",
    value: Category.fashion,
    icon: Shirt,
    color: "bg-purple-50 text-purple-600 border-purple-200",
  },
  {
    label: "Electronics",
    value: Category.electronics,
    icon: Tv,
    color: "bg-blue-50 text-blue-600 border-blue-200",
  },
  {
    label: "Home & Kitchen",
    value: Category.homeKitchen,
    icon: UtensilsCrossed,
    color: "bg-orange-50 text-orange-600 border-orange-200",
  },
  {
    label: "Beauty",
    value: Category.beauty,
    icon: Sparkles,
    color: "bg-rose-50 text-rose-600 border-rose-200",
  },
  {
    label: "Sports",
    value: Category.sports,
    icon: Dumbbell,
    color: "bg-green-50 text-green-600 border-green-200",
  },
  {
    label: "Kids",
    value: Category.kids,
    icon: Baby,
    color: "bg-yellow-50 text-yellow-600 border-yellow-200",
  },
];

const FEATURES = [
  { icon: Truck, label: "Free Delivery", desc: "On orders above ₹499" },
  { icon: RefreshCcw, label: "Easy Returns", desc: "7-day return policy" },
  { icon: ShieldCheck, label: "Secure Payments", desc: "100% safe & secure" },
];

export function HomePage() {
  const search = useSearch({ from: "/" });
  const navigate = useNavigate();
  const searchQuery = (search as { q?: string }).q ?? "";
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const { identity, login } = useInternetIdentity();

  const { data: backendProducts, isLoading } = useListProducts();
  const { data: searchResults } = useSearchProducts(searchQuery);
  const { data: categoryProducts } = useProductsByCategory(activeCategory);
  const addToCart = useAddToCart();

  const handleAddToCart = async (productId: bigint) => {
    if (!identity) {
      toast.error("Please login to add items to cart", {
        action: { label: "Login", onClick: login },
      });
      return;
    }
    try {
      await addToCart.mutateAsync({ productId, quantity: 1n });
      toast.success("Added to cart!");
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  // Determine which products to show
  let displayProducts: typeof MOCK_PRODUCTS = [];
  if (searchQuery) {
    displayProducts =
      (searchResults ?? []).length > 0
        ? (searchResults as unknown as typeof MOCK_PRODUCTS)
        : MOCK_PRODUCTS.filter((p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()),
          );
  } else if (activeCategory) {
    displayProducts =
      (categoryProducts ?? []).length > 0
        ? (categoryProducts as unknown as typeof MOCK_PRODUCTS)
        : MOCK_PRODUCTS.filter((p) => p.category === activeCategory);
  } else {
    displayProducts =
      (backendProducts ?? []).length > 0
        ? (backendProducts as unknown as typeof MOCK_PRODUCTS)
        : MOCK_PRODUCTS;
  }

  useEffect(() => {
    if (searchQuery) setActiveCategory(null);
  }, [searchQuery]);

  return (
    <main>
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-pink-50 via-orange-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 flex flex-col md:flex-row items-center gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 text-center md:text-left"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold mb-3">
              <Tag className="w-3.5 h-3.5" /> Special Offers Today!
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-extrabold text-foreground leading-tight mb-3">
              Shop Smart,
              <span className="text-primary block">Save More!</span>
            </h1>
            <p className="text-muted-foreground text-base mb-5">
              Millions of products. Best prices. Delivered to your door.
            </p>
            <button
              type="button"
              className="bg-primary text-white font-semibold px-6 py-2.5 rounded-full inline-flex items-center gap-2 hover:bg-primary/90 transition-colors"
              onClick={() => navigate({ to: "/", search: { q: undefined } })}
              data-ocid="hero.primary_button"
            >
              Shop Now <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1 max-w-md"
          >
            <img
              src="/assets/generated/hero-shopmart.dim_1200x400.jpg"
              alt="ShopMart - Shop Smart Save More"
              className="w-full rounded-2xl shadow-xl object-cover"
            />
          </motion.div>
        </div>

        {/* Feature strips */}
        <div className="border-t border-border/50 bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-center gap-6 md:gap-12 overflow-x-auto">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex items-center gap-2 text-sm shrink-0"
              >
                <Icon className="w-4 h-4 text-primary" />
                <div>
                  <span className="font-semibold">{label}</span>
                  <span className="text-muted-foreground hidden sm:inline">
                    {" "}
                    — {desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="max-w-7xl mx-auto px-4 pt-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map(({ label, value, icon: Icon, color }) => (
            <button
              type="button"
              key={label}
              onClick={() => {
                setActiveCategory(value);
                navigate({ to: "/", search: { q: undefined } });
              }}
              data-ocid={`category.${label.toLowerCase().replace(/[^a-z0-9]/g, "")}.tab`}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === value && !searchQuery
                  ? "bg-primary text-white border-primary shadow-md scale-105"
                  : `${color} hover:scale-105`
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-xl">
            {searchQuery
              ? `Results for "${searchQuery}"`
              : activeCategory
                ? CATEGORIES.find((c) => c.value === activeCategory)?.label
                : "All Products"}
          </h2>
          <span className="text-sm text-muted-foreground">
            {displayProducts.length} products
          </span>
        </div>

        {isLoading ? (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
            data-ocid="products.loading_state"
          >
            {["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "s10"].map(
              (k) => (
                <div key={k} className="rounded-xl overflow-hidden">
                  <Skeleton className="aspect-square w-full" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              ),
            )}
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-16" data-ocid="products.empty_state">
            <p className="text-4xl mb-3">🛍️</p>
            <p className="text-muted-foreground">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {displayProducts.map((product, i) => (
              <ProductCard
                key={product.id.toString()}
                product={product}
                onAddToCart={handleAddToCart}
                index={i}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
