import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import { storefrontApiRequest, STOREFRONT_PRODUCTS_QUERY, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { Link } from "react-router-dom";

const StorePage = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);
  const isCartLoading = useCartStore((s) => s.isLoading);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await storefrontApiRequest(STOREFRONT_PRODUCTS_QUERY, { first: 50 });
        setProducts(data?.data?.products?.edges || []);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

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
      <ParticleField count={8} />

      <div className="relative z-10 pt-20 sm:pt-24 pb-16 px-3 sm:px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-black tracking-wider gradient-text mb-2">
            THE COLLECTION
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-body">
            Discover our exclusive fragrance collection
          </p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-body">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {products.map((product, i) => {
              const image = product.node.images.edges[0]?.node;
              const price = product.node.priceRange.minVariantPrice;
              return (
                <motion.div
                  key={product.node.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-surface rounded-xl overflow-hidden group"
                >
                  <Link to={`/product/${product.node.handle}`}>
                    <div className="aspect-square overflow-hidden bg-secondary/10">
                      {image ? (
                        <img
                          src={image.url}
                          alt={image.altText || product.node.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No Image
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-3 sm:p-4">
                    <Link to={`/product/${product.node.handle}`}>
                      <h3 className="font-display text-xs sm:text-sm tracking-wide text-foreground mb-1 line-clamp-2 hover:text-primary transition-colors">
                        {product.node.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-muted-foreground font-body line-clamp-2 mb-2 hidden sm:block">
                      {product.node.description}
                    </p>
                    <div className="space-y-2">
                      <span className="font-display text-sm text-primary block">
                        {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
                      </span>
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 sm:h-8 px-2 sm:px-3 flex-1"
                          onClick={() => handleAddToCart(product)}
                          disabled={isCartLoading}
                        >
                          <ShoppingCart className="w-3 h-3 sm:mr-1" />
                          <span className="hidden sm:inline">Add</span>
                        </Button>
                        <Button
                          size="sm"
                          className="text-xs h-7 sm:h-8 px-2 sm:px-3 flex-1 glow-primary"
                          onClick={async () => {
                            await handleAddToCart(product);
                            const url = useCartStore.getState().getCheckoutUrl();
                            if (url) window.open(url, '_blank');
                          }}
                          disabled={isCartLoading}
                        >
                          <span className="text-[10px] sm:text-xs">Buy Now</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StorePage;
