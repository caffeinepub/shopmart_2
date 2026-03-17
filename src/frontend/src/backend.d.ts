import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface CartItem {
    productId: bigint;
    quantity: bigint;
}
export interface Order {
    id: bigint;
    status: OrderStatus;
    totalAmount: bigint;
    timestamp: Time;
    buyer: Principal;
    items: Array<CartItem>;
}
export interface UserProfile {
    name: string;
    role: string;
    email: string;
}
export interface Product {
    id: bigint;
    name: string;
    description: string;
    seller: Principal;
    isActive: boolean;
    stock: bigint;
    category: Category;
    image?: ExternalBlob;
    price: bigint;
}
export enum Category {
    kids = "kids",
    homeKitchen = "homeKitchen",
    beauty = "beauty",
    sports = "sports",
    fashion = "fashion",
    electronics = "electronics"
}
export enum OrderStatus {
    shipped = "shipped",
    cancelled = "cancelled",
    pending = "pending",
    delivered = "delivered",
    confirmed = "confirmed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addToCart(productId: bigint, quantity: bigint): Promise<Array<CartItem>>;
    addToResellerCatalog(productId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createProduct(name: string, description: string, price: bigint, category: Category, image: ExternalBlob | null, stock: bigint): Promise<bigint>;
    deleteProduct(id: bigint): Promise<void>;
    getAllOrders(): Promise<Array<Order>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Array<CartItem>>;
    getOrder(orderId: bigint): Promise<Order | null>;
    getOrderHistory(): Promise<Array<Order>>;
    getProduct(id: bigint): Promise<Product | null>;
    getProductsByCategory(category: Category): Promise<Array<Product>>;
    getResellerCatalog(): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listProducts(): Promise<Array<Product>>;
    placeOrder(): Promise<Order>;
    removeFromCart(productId: bigint): Promise<Array<CartItem>>;
    removeFromResellerCatalog(productId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchProducts(searchTerm: string): Promise<Array<Product>>;
    updateCartItem(productId: bigint, quantity: bigint): Promise<Array<CartItem>>;
    updateOrderStatus(orderId: bigint, status: OrderStatus): Promise<void>;
    updateProduct(id: bigint, name: string, description: string, price: bigint, category: Category, image: ExternalBlob | null, stock: bigint, isActive: boolean): Promise<void>;
    uploadImage(blob: ExternalBlob): Promise<ExternalBlob>;
}
