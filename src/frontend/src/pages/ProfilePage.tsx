import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Edit2, LogIn, ShieldCheck, Store, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend";
import { MOCK_PRODUCTS, formatPrice } from "../data/mockProducts";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useIsAdmin,
  useResellerCatalog,
  useSaveProfile,
  useUserProfile,
} from "../hooks/useQueries";

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

export function ProfilePage() {
  const { identity, login } = useInternetIdentity();
  const { data: profile, isLoading } = useUserProfile();
  const { data: resellerCatalog } = useResellerCatalog();
  const { data: isAdmin } = useIsAdmin();
  const saveProfile = useSaveProfile();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
    }
  }, [profile]);

  if (!identity) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="font-display text-2xl font-bold mb-2">My Profile</h2>
        <p className="text-muted-foreground mb-6">
          Please login to view your profile
        </p>
        <Button
          className="bg-primary text-white rounded-full px-8"
          onClick={() => login()}
          data-ocid="profile.login.button"
        >
          <LogIn className="w-4 h-4 mr-2" /> Login
        </Button>
      </main>
    );
  }

  if (isLoading) {
    return (
      <div
        className="max-w-2xl mx-auto px-4 py-8"
        data-ocid="profile.loading_state"
      >
        <Skeleton className="h-32 w-full rounded-xl mb-4" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    );
  }

  const handleSave = async () => {
    try {
      await saveProfile.mutateAsync({
        name,
        email,
        role: profile?.role ?? "user",
      });
      toast.success("Profile saved!");
      setEditing(false);
    } catch {
      toast.error("Failed to save profile");
    }
  };

  const principal = identity.getPrincipal().toString();

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="font-display text-2xl font-bold mb-6">My Profile</h1>

      {/* Profile Card */}
      <div className="bg-card rounded-2xl p-6 shadow-card mb-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display font-bold text-xl">
                {profile?.name || "Shopper"}
              </h2>
              {isAdmin && (
                <Badge className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Admin
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground font-mono truncate">
              {principal.slice(0, 20)}...
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditing(!editing)}
            data-ocid="profile.edit_button"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Full Name
            </Label>
            {editing ? (
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9"
                data-ocid="profile.name.input"
              />
            ) : (
              <p className="text-sm font-medium">{profile?.name || "—"}</p>
            )}
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Email
            </Label>
            {editing ? (
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="h-9"
                data-ocid="profile.email.input"
              />
            ) : (
              <p className="text-sm font-medium">{profile?.email || "—"}</p>
            )}
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Role
            </Label>
            <p className="text-sm font-medium capitalize">
              {profile?.role || "User"}
            </p>
          </div>
        </div>

        {editing && (
          <div className="flex gap-2 mt-4">
            <Button
              className="bg-primary text-white flex-1"
              onClick={handleSave}
              disabled={saveProfile.isPending}
              data-ocid="profile.save_button"
            >
              <Check className="w-4 h-4 mr-1" />
              {saveProfile.isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setEditing(false)}
              data-ocid="profile.cancel_button"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Reseller Catalog */}
      <div className="bg-card rounded-2xl p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Store className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-lg">
            My Reseller Catalog
          </h3>
          <Badge variant="secondary">{resellerCatalog?.length ?? 0}</Badge>
        </div>
        {!resellerCatalog || resellerCatalog.length === 0 ? (
          <p
            className="text-sm text-muted-foreground"
            data-ocid="reseller.empty_state"
          >
            No products in your catalog yet. Browse products and add them to
            resell!
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {resellerCatalog.map((product, index) => (
              <div
                key={product.id.toString()}
                className="flex gap-2 items-center"
                data-ocid={`reseller.item.${index + 1}`}
              >
                <img
                  src={getProductImage(product)}
                  alt={product.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{product.name}</p>
                  <p className="text-xs price-tag">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
