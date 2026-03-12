import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { storefrontApiRequest, STOREFRONT_PRODUCTS_QUERY, type ShopifyProduct } from "@/lib/shopify";
import { toast } from "sonner";

interface FavoriteItem {
  id: string;
  perfume_id: string;
  created_at: string;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [productsByHandle, setProductsByHandle] = useState<Record<string, ShopifyProduct>>({});
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [{ data: sessionRes }, favoritesRes, productsRes] = await Promise.all([
        supabase.auth.getSession(),
        supabase.from("favorites").select("id, perfume_id, created_at").order("created_at", { ascending: false }),
        storefrontApiRequest(STOREFRONT_PRODUCTS_QUERY, { first: 250 }),
      ]);

      const id = sessionRes.session?.user?.id ?? null;
      setUserId(id);

      const ownFavorites = (favoritesRes.data ?? []).filter((item) => !id || id === (sessionRes.session?.user?.id ?? null));
      setFavorites(ownFavorites);

      const map: Record<string, ShopifyProduct> = {};
      (productsRes?.data?.products?.edges ?? []).forEach((edge: ShopifyProduct) => {
        map[edge.node.handle] = edge;
      });
      setProductsByHandle(map);
    };

    load();
  }, []);

  const sortedFavorites = useMemo(() => favorites, [favorites]);

  const removeFavorite = async (perfumeId: string) => {
    if (!userId) return;

    const { error } = await supabase.from("favorites").delete().eq("user_id", userId).eq("perfume_id", perfumeId);
    if (error) {
      toast.error(error.message);
      return;
    }

    setFavorites((prev) => prev.filter((item) => item.perfume_id !== perfumeId));
    toast.success("Removed from favorites.");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleField count={4} />

      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 max-w-5xl mx-auto space-y-4">
        <div>
          <h1 className="font-display text-3xl font-black tracking-wider text-foreground flex items-center gap-2"><Heart className="w-6 h-6 text-primary" /> My Favorites</h1>
          <p className="text-sm text-muted-foreground">Manage perfumes you’ve saved.</p>
        </div>

        {sortedFavorites.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground mb-3">No favorites yet.</p>
              <Button asChild variant="outline"><Link to="/catalog">Browse catalog</Link></Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {sortedFavorites.map((favorite) => {
              const product = productsByHandle[favorite.perfume_id];
              const image = product?.node.images.edges[0]?.node;

              return (
                <Card key={favorite.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="aspect-video rounded-lg overflow-hidden bg-muted/20">
                      {image ? (
                        <img src={image.url} alt={image.altText || product.node.title} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No image</div>
                      )}
                    </div>
                    <div>
                      <p className="font-display text-base text-foreground">{product?.node.title || favorite.perfume_id}</p>
                      <p className="text-xs text-muted-foreground">Saved on {new Date(favorite.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm"><Link to={`/product/${favorite.perfume_id}`}>View details</Link></Button>
                      <Button variant="outline" size="sm" onClick={() => removeFavorite(favorite.perfume_id)} className="gap-1">
                        <Trash2 className="w-4 h-4" /> Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
