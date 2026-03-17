import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "@tanstack/react-router";
import {
  ChevronLeft,
  Heart,
  Minus,
  Package,
  Plus,
  Share2,
  ShoppingCart,
  Star,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { MOCK_PRODUCTS, formatPrice } from "../data/mockProducts";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddToCart,
  useAddToResellerCatalog,
  useGetProduct,
} from "../hooks/useQueries";

export function ProductDetailPage() {
  const { id } = useParams({ from: "/product/$id" });
  const productId = BigInt(id);
  const { data: backendProduct, isLoading } = useGetProduct(productId);
  const { identity, login } = useInternetIdentity();
  const addToCart = useAddToCart();
  const addToReseller = useAddToResellerCatalog();
  const [quantity, setQuantity] = useState(1);

  // Use backend or fallback to mock
  const mockProduct = MOCK_PRODUCTS.find((p) => p.id === productId);
  const product = backendProduct ?? mockProduct;

  const imageSrc = (() => {
    if (!product) return "";
    if ("image" in product && product.image) {
      if (typeof product.image === "string") return product.image;
      if (
        typeof product.image === "object" &&
        "getDirectURL" in product.image
      ) {
        return product.image.getDirectURL();
      }
    }
    return (
      mockProduct?.image ?? "/assets/generated/product-kurti.dim_400x400.jpg"
    );
  })();

  const handleAddToCart = async () => {
    if (!identity) {
      toast.error("Please login to add to cart", {
        action: { label: "Login", onClick: login },
      });
      return;
    }
    try {
      await addToCart.mutateAsync({ productId, quantity: BigInt(quantity) });
      toast.success(`${quantity} item(s) added to cart!`);
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const handleAddToReseller = async () => {
    if (!identity) {
      toast.error("Please login first", {
        action: { label: "Login", onClick: login },
      });
      return;
    }
    try {
      await addToReseller.mutateAsync(productId);
      toast.success("Added to your reseller catalog!");
    } catch {
      toast.error("Failed to add to reseller catalog");
    }
  };

  if (isLoading && !mockProduct) {
    return (
      <div
        className="max-w-4xl mx-auto px-4 py-8"
        data-ocid="product.loading_state"
      >
        <Skeleton className="h-96 w-full rounded-2xl mb-6" />
        <Skeleton className="h-8 w-2/3 mb-3" />
        <Skeleton className="h-6 w-1/4 mb-6" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div
        className="max-w-4xl mx-auto px-4 py-16 text-center"
        data-ocid="product.error_state"
      >
        <p className="text-4xl mb-3">😕</p>
        <h2 className="font-display text-2xl font-bold mb-2">
          Product not found
        </h2>
        <Link to="/" search={{ q: undefined }}>
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
    );
  }

  const rating = mockProduct?.rating ?? 4.2;
  const reviewCount = mockProduct?.reviewCount ?? 100;

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-5">
        <Link
          to="/"
          search={{ q: undefined }}
          className="hover:text-primary flex items-center gap-1"
          data-ocid="product.breadcrumb.link"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Home
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate">
          {product.name}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative"
        >
          <div className="aspect-square rounded-2xl overflow-hidden bg-muted/30">
            <img
              src={imageSrc}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <button
            type="button"
            className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:text-primary transition-colors"
            data-ocid="product.wishlist.button"
          >
            <Heart className="w-5 h-5" />
          </button>
          <button
            type="button"
            className="absolute top-3 left-3 bg-white rounded-full p-2 shadow-md hover:text-primary transition-colors"
            data-ocid="product.share.button"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-4"
        >
          <div>
            <Badge className="mb-2 bg-primary/10 text-primary border-primary/20">
              {product.category}
            </Badge>
            <h1 className="font-display font-bold text-2xl md:text-3xl leading-tight mb-2">
              {product.name}
            </h1>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.floor(rating)
                        ? "fill-accent text-accent"
                        : "text-muted fill-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {rating} ({reviewCount.toLocaleString("en-IN")} reviews)
              </span>
            </div>
          </div>

          <div>
            <p className="price-tag text-3xl">{formatPrice(product.price)}</p>
            <Badge className="mt-1 bg-green-50 text-green-700 border-green-200">
              Free Delivery
            </Badge>
          </div>

          <p className="text-muted-foreground text-sm leading-relaxed">
            {product.description}
          </p>

          {/* Stock */}
          <div className="flex items-center gap-2 text-sm">
            <Package className="w-4 h-4 text-green-600" />
            <span className="text-green-700 font-medium">
              {Number(product.stock) > 0
                ? `${product.stock} in stock`
                : "Out of Stock"}
            </span>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Quantity:</span>
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 hover:bg-muted transition-colors"
                data-ocid="product.quantity_decrease.button"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() =>
                  setQuantity(
                    Math.min(Number(product.stock) || 99, quantity + 1),
                  )
                }
                className="px-3 py-2 hover:bg-muted transition-colors"
                data-ocid="product.quantity_increase.button"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold h-11 rounded-xl"
              onClick={handleAddToCart}
              disabled={addToCart.isPending}
              data-ocid="product.add_to_cart.button"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {addToCart.isPending ? "Adding..." : "Add to Cart"}
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-primary text-primary hover:bg-primary/5 font-semibold h-11 rounded-xl"
              onClick={handleAddToReseller}
              disabled={addToReseller.isPending}
              data-ocid="product.reseller.button"
            >
              {addToReseller.isPending
                ? "Adding..."
                : "Add to Reseller Catalog"}
            </Button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
