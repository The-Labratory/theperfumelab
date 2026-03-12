import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, List, LayoutGrid, Loader2, ShoppingCart } from "lucide-react";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { storefrontApiRequest, STOREFRONT_PRODUCTS_QUERY, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

type ViewMode = "grid" | "list";
type ScentFamily = "Floral" | "Woody" | "Fresh" | "Oriental";
type Gender = "Women" | "Men" | "Unisex";

interface CatalogItem {
  product: ShopifyProduct;
  brand: string;
  scentFamily: ScentFamily;
  gender: Gender;
  price: number;
}

const guessFamily = (text: string): ScentFamily => {
  const source = text.toLowerCase();
  if (source.includes("rose") || source.includes("jasmine") || source.includes("floral")) return "Floral";
  if (source.includes("wood") || source.includes("cedar") || source.includes("oud")) return "Woody";
  if (source.includes("citrus") || source.includes("fresh") || source.includes("marine")) return "Fresh";
  return "Oriental";
};

const guessGender = (text: string): Gender => {
  const source = text.toLowerCase();
  if (source.includes("women") || source.includes("femme")) return "Women";
  if (source.includes("men") || source.includes("homme")) return "Men";
  return "Unisex";
};

export default function PerfumeCatalogPage() {
  const [products, setProducts] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [familyFilter, setFamilyFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [maxPrice, setMaxPrice] = useState("400");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [userId, setUserId] = useState<string | null>(null);
  const [favoriteHandles, setFavoriteHandles] = useState<Set<string>>(new Set());

  const addItem = useCartStore((s) => s.addItem);
  const isCartLoading = useCartStore((s) => s.isLoading);

  useEffect(() => {
    const load = async () => {
      const [{ data: sessionRes }, productsRes] = await Promise.all([
        supabase.auth.getSession(),
        storefrontApiRequest(STOREFRONT_PRODUCTS_QUERY, { first: 250 }),
      ]);

      const sessionUserId = sessionRes.session?.user?.id ?? null;
      setUserId(sessionUserId);

      const mapped: CatalogItem[] = (productsRes?.data?.products?.edges ?? []).map((edge: ShopifyProduct) => {
        const baseText = `${edge.node.title} ${edge.node.description}`;
        return {
          product: edge,
          brand: "The Perfume Lab",
          scentFamily: guessFamily(baseText),
          gender: guessGender(baseText),
          price: Number(edge.node.priceRange.minVariantPrice.amount),
        };
      });

      setProducts(mapped);

      if (sessionUserId) {
        const { data: favs } = await supabase.from("favorites").select("perfume_id").eq("user_id", sessionUserId);
        setFavoriteHandles(new Set((favs ?? []).map((f) => f.perfume_id)));
      }

      setLoading(false);
    };

    load();
  }, []);

  const filtered = useMemo(() => {
    const max = Number(maxPrice) || Infinity;
    return products.filter((item) => {
      const text = `${item.product.node.title} ${item.product.node.description}`.toLowerCase();
      const searchMatch = !search.trim() || text.includes(search.toLowerCase());
      const brandMatch = brandFilter === "all" || item.brand === brandFilter;
      const familyMatch = familyFilter === "all" || item.scentFamily === familyFilter;
      const genderMatch = genderFilter === "all" || item.gender === genderFilter;
      const priceMatch = item.price <= max;
      return searchMatch && brandMatch && familyMatch && genderMatch && priceMatch;
    });
  }, [products, search, brandFilter, familyFilter, genderFilter, maxPrice]);

  const handleFavoriteToggle = async (handle: string) => {
    if (!userId) {
      toast.error("Sign in to save favorites.");
      return;
    }

    const isFavorite = favoriteHandles.has(handle);
    if (isFavorite) {
      const { error } = await supabase.from("favorites").delete().eq("user_id", userId).eq("perfume_id", handle);
      if (error) return toast.error(error.message);
      setFavoriteHandles((prev) => {
        const next = new Set(prev);
        next.delete(handle);
        return next;
      });
      return;
    }

    const { error } = await supabase.from("favorites").insert({ user_id: userId, perfume_id: handle });
    if (error) return toast.error(error.message);
    setFavoriteHandles((prev) => new Set(prev).add(handle));
  };

  const handleAddToCart = async (product: ShopifyProduct) => {
    const variant = product.node.variants.edges[0]?.node;
    if (!variant) return;

    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });

    toast.success(`${product.node.title} added to cart`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleField count={6} />

      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 max-w-7xl mx-auto space-y-5">
        <div className="flex flex-wrap gap-3 items-end justify-between">
          <div>
            <h1 className="font-display text-3xl font-black tracking-wider text-foreground">Perfume Catalog</h1>
            <p className="text-sm text-muted-foreground">Search, filter, save favorites, and add to cart.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}><LayoutGrid className="w-4 h-4" /></Button>
            <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}><List className="w-4 h-4" /></Button>
          </div>
        </div>

        <div className="grid md:grid-cols-5 gap-3">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search perfumes" className="md:col-span-2" />
          <Select value={brandFilter} onValueChange={setBrandFilter}>
            <SelectTrigger><SelectValue placeholder="Brand" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              <SelectItem value="The Perfume Lab">The Perfume Lab</SelectItem>
            </SelectContent>
          </Select>
          <Select value={familyFilter} onValueChange={setFamilyFilter}>
            <SelectTrigger><SelectValue placeholder="Scent family" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Families</SelectItem>
              <SelectItem value="Floral">Floral</SelectItem>
              <SelectItem value="Woody">Woody</SelectItem>
              <SelectItem value="Fresh">Fresh</SelectItem>
              <SelectItem value="Oriental">Oriental</SelectItem>
            </SelectContent>
          </Select>
          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger><SelectValue placeholder="Gender" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genders</SelectItem>
              <SelectItem value="Women">Women</SelectItem>
              <SelectItem value="Men">Men</SelectItem>
              <SelectItem value="Unisex">Unisex</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="max-w-xs">
          <p className="text-xs text-muted-foreground mb-1">Max price</p>
          <Input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} type="number" min="0" />
        </div>

        {loading ? (
          <div className="py-20 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No perfumes match your filters.</CardContent></Card>
        ) : (
          <div className={viewMode === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
            {filtered.map((item) => {
              const image = item.product.node.images.edges[0]?.node;
              const isFavorite = favoriteHandles.has(item.product.node.handle);

              return (
                <Card key={item.product.node.id}>
                  <CardContent className={viewMode === "grid" ? "p-4" : "p-4 flex gap-4"}>
                    <Link to={`/product/${item.product.node.handle}`} className={viewMode === "grid" ? "block" : "w-24 shrink-0"}>
                      <div className={viewMode === "grid" ? "aspect-square rounded-lg overflow-hidden bg-muted/20 mb-3" : "aspect-square rounded-lg overflow-hidden bg-muted/20"}>
                        {image ? (
                          <img src={image.url} alt={image.altText || item.product.node.title} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No image</div>
                        )}
                      </div>
                    </Link>

                    <div className="flex-1 space-y-2">
                      <p className="text-xs text-muted-foreground">{item.brand} · {item.scentFamily} · {item.gender}</p>
                      <Link to={`/product/${item.product.node.handle}`} className="font-display text-base text-foreground hover:text-primary transition-colors line-clamp-2">{item.product.node.title}</Link>
                      <p className="text-sm text-primary font-display font-bold">{item.product.node.priceRange.minVariantPrice.currencyCode} {item.price.toFixed(2)}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleFavoriteToggle(item.product.node.handle)} className="gap-1">
                          <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
                          {isFavorite ? "Saved" : "Favorite"}
                        </Button>
                        <Button size="sm" onClick={() => handleAddToCart(item.product)} disabled={isCartLoading} className="gap-1">
                          <ShoppingCart className="w-4 h-4" /> Add to cart
                        </Button>
                      </div>
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
