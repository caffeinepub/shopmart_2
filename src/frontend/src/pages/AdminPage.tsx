import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Package, Percent, Plus, ShieldOff, Tag, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Category, OrderStatus } from "../backend";
import type { Product } from "../backend";
import { MOCK_PRODUCTS, formatPrice } from "../data/mockProducts";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  DiscountType,
  useAllOrders,
  useCreateCoupon,
  useCreateProduct,
  useDeleteCoupon,
  useDeleteProduct,
  useIsAdmin,
  useListCoupons,
  useListProducts,
  useUpdateOrderStatus,
} from "../hooks/useQueries";

const STATUS_OPTIONS = [
  { value: OrderStatus.pending, label: "Pending" },
  { value: OrderStatus.confirmed, label: "Confirmed" },
  { value: OrderStatus.shipped, label: "Shipped" },
  { value: OrderStatus.delivered, label: "Delivered" },
  { value: OrderStatus.cancelled, label: "Cancelled" },
];

const CATEGORY_OPTIONS = [
  { value: Category.fashion, label: "Fashion" },
  { value: Category.electronics, label: "Electronics" },
  { value: Category.homeKitchen, label: "Home & Kitchen" },
  { value: Category.beauty, label: "Beauty" },
  { value: Category.sports, label: "Sports" },
  { value: Category.kids, label: "Kids" },
];

type AnyProduct = Product | (typeof MOCK_PRODUCTS)[number];

function getProductImage(product: AnyProduct): string {
  if ("image" in product && product.image) {
    if (typeof product.image === "string") return product.image;
    if (typeof product.image === "object" && "getDirectURL" in product.image) {
      return product.image.getDirectURL();
    }
  }
  return (
    MOCK_PRODUCTS.find((p) => p.id === product.id)?.image ??
    "/assets/generated/product-kurti.dim_400x400.jpg"
  );
}

export function AdminPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: backendProducts, isLoading: productsLoading } =
    useListProducts();
  const { data: allOrders, isLoading: ordersLoading } = useAllOrders();
  const { data: coupons, isLoading: couponsLoading } = useListCoupons();
  const updateOrderStatus = useUpdateOrderStatus();
  const createProduct = useCreateProduct();
  const deleteProduct = useDeleteProduct();
  const createCoupon = useCreateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const [addOpen, setAddOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: Category.fashion,
    stock: "",
  });

  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountType: DiscountType.percentage,
    value: "",
  });

  const products =
    (backendProducts ?? []).length > 0
      ? (backendProducts as AnyProduct[])
      : (MOCK_PRODUCTS as AnyProduct[]);

  if (!identity) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <ShieldOff className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="font-display text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">
          Please login with an admin account
        </p>
      </main>
    );
  }

  if (adminLoading) {
    return (
      <div
        className="max-w-4xl mx-auto px-4 py-8"
        data-ocid="admin.loading_state"
      >
        <Skeleton className="h-10 w-48 mb-6" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <ShieldOff className="w-16 h-16 mx-auto mb-4 text-destructive" />
        <h2 className="font-display text-2xl font-bold mb-2">Not Authorized</h2>
        <p className="text-muted-foreground">You don't have admin access</p>
      </main>
    );
  }

  const handleCreateProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      await createProduct.mutateAsync({
        name: newProduct.name,
        description: newProduct.description,
        price: BigInt(Math.round(Number.parseFloat(newProduct.price) * 100)),
        category: newProduct.category,
        stock: BigInt(newProduct.stock),
      });
      toast.success("Product created!");
      setAddOpen(false);
      setNewProduct({
        name: "",
        description: "",
        price: "",
        category: Category.fashion,
        stock: "",
      });
    } catch {
      toast.error("Failed to create product");
    }
  };

  const handleDeleteProduct = async (id: bigint) => {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteProduct.mutateAsync(id);
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const handleStatusChange = async (orderId: bigint, status: OrderStatus) => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, status });
      toast.success("Order status updated");
    } catch {
      toast.error("Failed to update order status");
    }
  };

  const handleCreateCoupon = async () => {
    if (!newCoupon.code.trim() || !newCoupon.value) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      await createCoupon.mutateAsync({
        code: newCoupon.code.trim().toUpperCase(),
        discountType: newCoupon.discountType,
        value: BigInt(Math.round(Number.parseFloat(newCoupon.value))),
      });
      toast.success("Coupon created!");
      setNewCoupon({
        code: "",
        discountType: DiscountType.percentage,
        value: "",
      });
    } catch {
      toast.error("Failed to create coupon");
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    try {
      await deleteCoupon.mutateAsync(code);
      toast.success("Coupon deleted");
    } catch {
      toast.error("Failed to delete coupon");
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
        <Badge className="bg-primary/10 text-primary border-primary/20">
          Admin
        </Badge>
      </div>

      <Tabs defaultValue="products" data-ocid="admin.tab">
        <TabsList className="mb-5">
          <TabsTrigger value="products" data-ocid="admin.products.tab">
            Products
          </TabsTrigger>
          <TabsTrigger value="orders" data-ocid="admin.orders.tab">
            Orders
          </TabsTrigger>
          <TabsTrigger value="coupons" data-ocid="admin.coupons.tab">
            Coupons
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">
              {products.length} products
            </p>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-primary text-white gap-2"
                  data-ocid="admin.product.open_modal_button"
                >
                  <Plus className="w-4 h-4" /> Add Product
                </Button>
              </DialogTrigger>
              <DialogContent data-ocid="admin.product.dialog">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div>
                    <Label>Product Name *</Label>
                    <Input
                      value={newProduct.name}
                      onChange={(e) =>
                        setNewProduct((p) => ({ ...p, name: e.target.value }))
                      }
                      placeholder="e.g. Floral Kurti"
                      data-ocid="admin.product.name.input"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={newProduct.description}
                      onChange={(e) =>
                        setNewProduct((p) => ({
                          ...p,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Product description..."
                      data-ocid="admin.product.description.textarea"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Price (₹) *</Label>
                      <Input
                        type="number"
                        value={newProduct.price}
                        onChange={(e) =>
                          setNewProduct((p) => ({
                            ...p,
                            price: e.target.value,
                          }))
                        }
                        placeholder="e.g. 399"
                        data-ocid="admin.product.price.input"
                      />
                    </div>
                    <div>
                      <Label>Stock *</Label>
                      <Input
                        type="number"
                        value={newProduct.stock}
                        onChange={(e) =>
                          setNewProduct((p) => ({
                            ...p,
                            stock: e.target.value,
                          }))
                        }
                        placeholder="e.g. 50"
                        data-ocid="admin.product.stock.input"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={newProduct.category}
                      onValueChange={(v) =>
                        setNewProduct((p) => ({
                          ...p,
                          category: v as Category,
                        }))
                      }
                    >
                      <SelectTrigger data-ocid="admin.product.category.select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setAddOpen(false)}
                    data-ocid="admin.product.cancel_button"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-primary text-white"
                    onClick={handleCreateProduct}
                    disabled={createProduct.isPending}
                    data-ocid="admin.product.submit_button"
                  >
                    {createProduct.isPending ? "Creating..." : "Create Product"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {productsLoading ? (
            <div className="space-y-3" data-ocid="products.loading_state">
              {["s1", "s2", "s3"].map((k) => (
                <Skeleton key={k} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product, index) => (
                <div
                  key={product.id.toString()}
                  className="bg-card rounded-xl p-4 shadow-card flex items-center gap-4"
                  data-ocid={`admin.product.item.${index + 1}`}
                >
                  <img
                    src={getProductImage(product)}
                    alt={product.name}
                    className="w-14 h-14 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{product.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm price-tag">
                        {formatPrice(product.price)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Stock: {product.stock.toString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteProduct(product.id)}
                    data-ocid={`admin.product.delete_button.${index + 1}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          {ordersLoading ? (
            <div className="space-y-3" data-ocid="orders.loading_state">
              {["s1", "s2", "s3"].map((k) => (
                <Skeleton key={k} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : !allOrders || allOrders.length === 0 ? (
            <div className="text-center py-12" data-ocid="orders.empty_state">
              <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allOrders.map((order, index) => (
                <div
                  key={order.id.toString()}
                  className="bg-card rounded-xl p-4 shadow-card flex items-center gap-4"
                  data-ocid={`admin.order.item.${index + 1}`}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-sm">
                      Order #{order.id.toString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.items.length} items ·{" "}
                      {formatPrice(order.totalAmount)}
                    </p>
                  </div>
                  <Select
                    value={order.status}
                    onValueChange={(v) =>
                      handleStatusChange(order.id, v as OrderStatus)
                    }
                  >
                    <SelectTrigger
                      className="w-36"
                      data-ocid={`admin.order.status.select.${index + 1}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Coupons Tab */}
        <TabsContent value="coupons">
          {/* Create Coupon Form */}
          <div className="bg-card rounded-xl p-5 shadow-card mb-5">
            <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" />
              Create New Coupon
            </h3>
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Coupon Code *
                </Label>
                <Input
                  value={newCoupon.code}
                  onChange={(e) =>
                    setNewCoupon((p) => ({
                      ...p,
                      code: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="e.g. SAVE20"
                  className="uppercase"
                  data-ocid="admin.coupons.code_input"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Discount Type *
                </Label>
                <Select
                  value={newCoupon.discountType}
                  onValueChange={(v) =>
                    setNewCoupon((p) => ({
                      ...p,
                      discountType: v as DiscountType,
                    }))
                  }
                >
                  <SelectTrigger data-ocid="admin.coupons.type_select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={DiscountType.percentage}>
                      <div className="flex items-center gap-2">
                        <Percent className="w-3.5 h-3.5" /> Percentage (%)
                      </div>
                    </SelectItem>
                    <SelectItem value={DiscountType.flat}>
                      <div className="flex items-center gap-2">
                        ₹ Flat Amount
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Value *{" "}
                  {newCoupon.discountType === DiscountType.percentage
                    ? "(%)"
                    : "(₹)"}
                </Label>
                <Input
                  type="number"
                  value={newCoupon.value}
                  onChange={(e) =>
                    setNewCoupon((p) => ({ ...p, value: e.target.value }))
                  }
                  placeholder={
                    newCoupon.discountType === DiscountType.percentage
                      ? "e.g. 20"
                      : "e.g. 100"
                  }
                  data-ocid="admin.coupons.value_input"
                />
              </div>
            </div>
            <Button
              className="mt-4 bg-primary text-white gap-2"
              onClick={handleCreateCoupon}
              disabled={createCoupon.isPending}
              data-ocid="admin.coupons.create.submit_button"
            >
              <Plus className="w-4 h-4" />
              {createCoupon.isPending ? "Creating..." : "Create Coupon"}
            </Button>
          </div>

          {/* Coupons List */}
          {couponsLoading ? (
            <div className="space-y-3" data-ocid="coupons.loading_state">
              {["s1", "s2"].map((k) => (
                <Skeleton key={k} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : !coupons || coupons.length === 0 ? (
            <div
              className="text-center py-10"
              data-ocid="admin.coupons.empty_state"
            >
              <Tag className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">
                No coupons yet. Create your first coupon above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {coupons.map((coupon, index) => (
                <div
                  key={coupon.code}
                  className="bg-card rounded-xl p-4 shadow-card flex items-center gap-4"
                  data-ocid={`admin.coupons.item.${index + 1}`}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Tag className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm tracking-wide">
                      {coupon.code}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {coupon.discountType === DiscountType.percentage
                          ? `${coupon.value.toString()}% off`
                          : `₹${coupon.value.toString()} off`}
                      </Badge>
                      <Badge
                        className={`text-xs ${
                          coupon.isActive
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-gray-100 text-gray-500 border-gray-200"
                        }`}
                        variant="outline"
                      >
                        {coupon.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteCoupon(coupon.code)}
                    data-ocid={`admin.coupons.delete_button.${index + 1}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}
