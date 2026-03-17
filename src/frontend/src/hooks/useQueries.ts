import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Category, OrderStatus } from "../backend";
import type { UserProfile } from "../backend";
import { useActor } from "./useActor";

// DiscountType is defined here since backend.ts is auto-generated and may not include it yet
export enum DiscountType {
  percentage = "percentage",
  flat = "flat",
}

export interface DiscountCoupon {
  code: string;
  discountType: DiscountType;
  value: bigint;
  isActive: boolean;
}

export interface CouponResult {
  valid: boolean;
  discountAmount: bigint;
  message: string;
}

export function useListProducts() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProduct(id: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["product", id.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getProduct(id);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchProducts(term: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["products", "search", term],
    queryFn: async () => {
      if (!actor || !term) return [];
      return actor.searchProducts(term);
    },
    enabled: !!actor && !isFetching && term.length > 0,
  });
}

export function useProductsByCategory(category: Category | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["products", "category", category],
    queryFn: async () => {
      if (!actor || !category) return [];
      return actor.getProductsByCategory(category);
    },
    enabled: !!actor && !isFetching && !!category,
  });
}

export function useGetCart() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCart();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddToCart() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: { productId: bigint; quantity: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addToCart(productId, quantity);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useRemoveFromCart() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.removeFromCart(productId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useUpdateCartItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: { productId: bigint; quantity: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateCartItem(productId, quantity);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.placeOrder();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function usePlaceOrderWithCoupon() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (couponCode: string | null) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).placeOrderWithCoupon(couponCode);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useOrderHistory() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrderHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllOrders() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: { orderId: bigint; status: OrderStatus }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateOrderStatus(orderId, status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allOrders"] });
    },
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useResellerCatalog() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["resellerCatalog"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getResellerCatalog();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddToResellerCatalog() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.addToResellerCatalog(productId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["resellerCatalog"] });
    },
  });
}

export function useCreateProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      price: bigint;
      category: Category;
      stock: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createProduct(
        data.name,
        data.description,
        data.price,
        data.category,
        null,
        data.stock,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteProduct(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useListCoupons() {
  const { actor, isFetching } = useActor();
  return useQuery<DiscountCoupon[]>({
    queryKey: ["coupons"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).listCoupons();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateCoupon() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      code: string;
      discountType: DiscountType;
      value: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).createCoupon(
        data.code,
        data.discountType,
        data.value,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
}

export function useDeleteCoupon() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).deleteCoupon(code);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
}

export function useValidateCoupon() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      code,
      cartTotal,
    }: { code: string; cartTotal: bigint }): Promise<CouponResult> => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).validateCoupon(code, cartTotal);
    },
  });
}
