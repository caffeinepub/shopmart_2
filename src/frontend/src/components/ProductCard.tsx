import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ShoppingCart, Star } from "lucide-react";
import { motion } from "motion/react";
import type { Product } from "../backend";
import { type MockProduct, formatPrice } from "../data/mockProducts";

type ProductCardData =
  | MockProduct
  | (Product & { rating?: number; reviewCount?: number });

function getImageSrc(product: ProductCardData): string {
  if ("image" in product && product.image) {
    if (typeof product.image === "string") return product.image;
    if (typeof product.image === "object" && "getDirectURL" in product.image) {
      return product.image.getDirectURL();
    }
  }
  return "/assets/generated/product-kurti.dim_400x400.jpg";
}

interface ProductCardProps {
  product: ProductCardData;
  onAddToCart?: (id: bigint) => void;
  index?: number;
}

export function ProductCard({
  product,
  onAddToCart,
  index = 0,
}: ProductCardProps) {
  const imageSrc = getImageSrc(product);
  const rating = (product as MockProduct).rating ?? 4.2;
  const reviewCount = (product as MockProduct).reviewCount ?? 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group bg-card rounded-xl overflow-hidden shadow-card hover:shadow-product hover:-translate-y-1 transition-all duration-300"
      data-ocid={`product.item.${index + 1}`}
    >
      <Link to="/product/$id" params={{ id: product.id.toString() }}>
        <div className="aspect-square overflow-hidden bg-muted/30">
          <img
            src={imageSrc}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
      </Link>
      <div className="p-3">
        <Link to="/product/$id" params={{ id: product.id.toString() }}>
          <h3 className="font-semibold text-sm line-clamp-2 mb-1 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-3 h-3 fill-accent text-accent" />
          <span className="text-xs text-muted-foreground">
            {rating} ({reviewCount.toLocaleString("en-IN")})
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="price-tag text-base">
            {formatPrice(product.price)}
          </span>
          <Badge
            variant="secondary"
            className="text-xs px-1.5 py-0.5 bg-green-50 text-green-700 border-green-200"
          >
            Free Delivery
          </Badge>
        </div>
        <Button
          className="w-full mt-2 h-8 text-xs font-semibold bg-primary hover:bg-primary/90 text-white rounded-lg"
          onClick={(e) => {
            e.preventDefault();
            onAddToCart?.(product.id);
          }}
          data-ocid={`product.add_to_cart.button.${index + 1}`}
        >
          <ShoppingCart className="w-3.5 h-3.5 mr-1" /> Add to Cart
        </Button>
      </div>
    </motion.div>
  );
}
