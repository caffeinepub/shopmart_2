import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  LogIn,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend";
import { MOCK_PRODUCTS, formatPrice } from "../data/mockProducts";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCart,
  useListProducts,
  usePlaceOrderWithCoupon,
  useRemoveFromCart,
  useUpdateCartItem,
  useValidateCoupon,
} from "../hooks/useQueries";

type AnyProduct = Product | (typeof MOCK_PRODUCTS)[number];

function getProductPrice(product: AnyProduct): bigint {
  return product.price;
}

function getProductName(product: AnyProduct): string {
  return product.name;
}

function getProductImage(product: AnyProduct): string {
  if ("image" in product && product.image) {
    if (typeof product.image === "string") return product.image;
    if (typeof product.image === "object" && "getDirectURL" in product.image) {
      return product.image.getDirectURL();
    }
  }
  const mock = MOCK_PRODUCTS.find((p) => p.id === product.id);
  return mock?.image ?? "/assets/generated/product-kurti.dim_400x400.jpg";
}

export function CartPage() {
  const { identity, login } = useInternetIdentity();
  const { data: cartItems, isLoading: cartLoading } = useGetCart();
  const { data: backendProducts } = useListProducts();
  const removeFromCart = useRemoveFromCart();
  const updateCartItem = useUpdateCartItem();
  const placeOrderWithCoupon = usePlaceOrderWithCoupon();
  const validateCoupon = useValidateCoupon();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState<bigint>(BigInt(0));

  const findProduct = (productId: bigint): AnyProduct | null => {
    const backend = backendProducts?.find((p) => p.id === productId);
    if (backend) return backend;
    return MOCK_PRODUCTS.find((p) => p.id === productId) ?? null;
  };

  const cartWithProducts = (cartItems ?? []).map((item) => ({
    item,
    product: findProduct(item.productId),
  }));

  const subtotal = cartWithProducts.reduce((sum, { item, product }) => {
    if (!product) return sum;
    return sum + Number(getProductPrice(product)) * Number(item.quantity);
  }, 0);

  const finalTotal = Math.max(0, subtotal - Number(discountAmount));

  const handleRemove = async (productId: bigint) => {
    try {
      await removeFromCart.mutateAsync(productId);
      toast.success("Removed from cart");
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const handleQuantityChange = async (productId: bigint, newQty: number) => {
    if (newQty < 1) return;
    try {
      await updateCartItem.mutateAsync({ productId, quantity: BigInt(newQty) });
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const result = await validateCoupon.mutateAsync({
        code: couponCode.trim().toUpperCase(),
        cartTotal: BigInt(subtotal),
      });
      if (result.valid) {
        setAppliedCoupon(couponCode.trim().toUpperCase());
        setDiscountAmount(result.discountAmount);
        toast.success(
          `Coupon applied! You save ${formatPrice(result.discountAmount)} 🎉`,
        );
        setCouponCode("");
      } else {
        toast.error(result.message || "Invalid coupon code");
      }
    } catch {
      toast.error("Failed to validate coupon");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(BigInt(0));
    setCouponCode("");
    toast.success("Coupon removed");
  };

  const handlePlaceOrder = async () => {
    try {
      await placeOrderWithCoupon.mutateAsync(appliedCoupon);
      toast.success("Order placed successfully! 🎉");
      navigate({ to: "/orders" });
    } catch {
      toast.error("Failed to place order");
    }
  };

  if (!identity) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="font-display text-2xl font-bold mb-2">
          Your cart awaits
        </h2>
        <p className="text-muted-foreground mb-6">
          Please login to view your cart
        </p>
        <Button
          className="bg-primary text-white rounded-full px-8"
          onClick={() => login()}
          data-ocid="cart.login.button"
        >
          <LogIn className="w-4 h-4 mr-2" /> Login to Continue
        </Button>
      </main>
    );
  }

  if (cartLoading) {
    return (
      <div
        className="max-w-2xl mx-auto px-4 py-8 space-y-4"
        data-ocid="cart.loading_state"
      >
        {["s1", "s2", "s3"].map((k) => (
          <div key={k} className="flex gap-4">
            <Skeleton className="w-24 h-24 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (cartWithProducts.length === 0) {
    return (
      <main
        className="max-w-2xl mx-auto px-4 py-16 text-center"
        data-ocid="cart.empty_state"
      >
        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="font-display text-2xl font-bold mb-2">
          Your cart is empty
        </h2>
        <p className="text-muted-foreground mb-6">
          Add some products to get started
        </p>
        <Link to="/" search={{ q: undefined }}>
          <Button
            className="bg-primary text-white rounded-full px-8"
            data-ocid="cart.shop_now.button"
          >
            Shop Now
          </Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="font-display text-2xl font-bold mb-6">
        My Cart ({cartWithProducts.length} items)
      </h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          <AnimatePresence>
            {cartWithProducts.map(({ item, product }, index) => (
              <motion.div
                key={item.productId.toString()}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-xl p-4 shadow-card flex gap-4"
                data-ocid={`cart.item.${index + 1}`}
              >
                {product && (
                  <img
                    src={getProductImage(product)}
                    alt={getProductName(product)}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm mb-1 truncate">
                    {product
                      ? getProductName(product)
                      : `Product #${item.productId}`}
                  </h3>
                  {product && (
                    <p className="price-tag text-base">
                      {formatPrice(getProductPrice(product))}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border border-border rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() =>
                          handleQuantityChange(
                            item.productId,
                            Number(item.quantity) - 1,
                          )
                        }
                        className="px-2 py-1 hover:bg-muted"
                        data-ocid={`cart.quantity_decrease.button.${index + 1}`}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-sm font-semibold">
                        {item.quantity.toString()}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleQuantityChange(
                            item.productId,
                            Number(item.quantity) + 1,
                          )
                        }
                        className="px-2 py-1 hover:bg-muted"
                        data-ocid={`cart.quantity_increase.button.${index + 1}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.productId)}
                      className="text-destructive hover:text-destructive/80 transition-colors"
                      data-ocid={`cart.delete_button.${index + 1}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {product && (
                  <div className="text-right">
                    <p className="font-bold text-primary">
                      {formatPrice(
                        BigInt(
                          Number(getProductPrice(product)) *
                            Number(item.quantity),
                        ),
                      )}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="bg-card rounded-xl p-5 shadow-card h-fit sticky top-20 space-y-4">
          <h2 className="font-display font-bold text-lg">Order Summary</h2>

          {/* Coupon Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Tag className="w-3.5 h-3.5" />
              <span>Have a coupon?</span>
            </div>
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">
                <div>
                  <p className="text-xs text-green-700 dark:text-green-400 font-semibold">
                    {appliedCoupon}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500">
                    -{formatPrice(discountAmount)} off
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-green-600 hover:text-green-800 dark:text-green-400 transition-colors"
                  data-ocid="cart.coupon.delete_button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="text-sm h-9 uppercase"
                  onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                  data-ocid="cart.coupon_input"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleApplyCoupon}
                  disabled={!couponCode.trim() || validateCoupon.isPending}
                  className="h-9 px-3 shrink-0 border-primary text-primary hover:bg-primary hover:text-white"
                  data-ocid="cart.coupon.submit_button"
                >
                  {validateCoupon.isPending ? "..." : "Apply"}
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Price breakdown */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">
                {formatPrice(BigInt(subtotal))}
              </span>
            </div>
            {discountAmount > BigInt(0) && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({appliedCoupon})</span>
                <span className="font-medium">
                  -{formatPrice(discountAmount)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span className="text-green-600 font-medium">FREE</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="price-tag">
                {formatPrice(BigInt(finalTotal))}
              </span>
            </div>
          </div>

          <Button
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold h-11 rounded-xl"
            onClick={handlePlaceOrder}
            disabled={placeOrderWithCoupon.isPending}
            data-ocid="cart.place_order.primary_button"
          >
            {placeOrderWithCoupon.isPending
              ? "Placing Order..."
              : "Place Order"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </main>
  );
}
