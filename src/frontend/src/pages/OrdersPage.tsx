import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { LogIn, Package, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import { OrderStatus } from "../backend";
import { formatPrice } from "../data/mockProducts";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useOrderHistory } from "../hooks/useQueries";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  [OrderStatus.pending]: {
    label: "Pending",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  [OrderStatus.confirmed]: {
    label: "Confirmed",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  [OrderStatus.shipped]: {
    label: "Shipped",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  [OrderStatus.delivered]: {
    label: "Delivered",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  [OrderStatus.cancelled]: {
    label: "Cancelled",
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

export function OrdersPage() {
  const { identity, login } = useInternetIdentity();
  const { data: orders, isLoading } = useOrderHistory();

  if (!identity) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="font-display text-2xl font-bold mb-2">
          View Your Orders
        </h2>
        <p className="text-muted-foreground mb-6">
          Please login to see your order history
        </p>
        <Button
          className="bg-primary text-white rounded-full px-8"
          onClick={() => login()}
          data-ocid="orders.login.button"
        >
          <LogIn className="w-4 h-4 mr-2" /> Login
        </Button>
      </main>
    );
  }

  if (isLoading) {
    return (
      <div
        className="max-w-2xl mx-auto px-4 py-8 space-y-4"
        data-ocid="orders.loading_state"
      >
        {["s1", "s2", "s3"].map((k) => (
          <Skeleton key={k} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <main
        className="max-w-2xl mx-auto px-4 py-16 text-center"
        data-ocid="orders.empty_state"
      >
        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="font-display text-2xl font-bold mb-2">No orders yet</h2>
        <p className="text-muted-foreground mb-6">
          Start shopping to see your orders here
        </p>
        <Link to="/" search={{ q: undefined }}>
          <Button
            className="bg-primary text-white rounded-full px-8"
            data-ocid="orders.shop_now.button"
          >
            Shop Now
          </Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="font-display text-2xl font-bold mb-6">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order, index) => {
          const statusConfig = STATUS_CONFIG[order.status] ?? {
            label: order.status,
            className: "bg-muted",
          };
          const date = new Date(Number(order.timestamp) / 1_000_000);
          return (
            <motion.div
              key={order.id.toString()}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-xl p-5 shadow-card"
              data-ocid={`orders.item.${index + 1}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-sm mb-1">
                    Order #{order.id.toString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {date.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {order.items.length} item(s)
                  </p>
                </div>
                <div className="text-right">
                  <Badge className={`text-xs ${statusConfig.className} mb-2`}>
                    {statusConfig.label}
                  </Badge>
                  <p className="price-tag text-lg block">
                    {formatPrice(order.totalAmount)}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </main>
  );
}
