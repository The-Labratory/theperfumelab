import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import { storefrontApiRequest, STOREFRONT_PRODUCT_BY_HANDLE_QUERY } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";

interface ProductData {
  id: string;
  title: string;
  description: string;
  handle: string;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  images: { edges: Array<{ node: { url: string; altText: string | null } }> };
  variants: { edges: Array<{ node: { id: string; title: string; price: { amount: string; currencyCode: string }; availableForSale: boolean; selectedOptions: Array<{ name: string; value: string }> } }> };
  options: Array<{ name: string; values: string[] }>;
}

const ProductPage = () => {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const addItem = useCartStore((s) => s.addItem);
  const isCartLoading = useCartStore((s) => s.isLoading);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await storefrontApiRequest(STOREFRONT_PRODUCT_BY_HANDLE_QUERY, { handle });
        const p = data?.data?.productByHandle;
        setProduct(p);
        if (p?.variants?.edges?.[0]) setSelectedVariant(p.variants.edges[0].node.id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [handle]);

  const variant = product?.variants.edges.find(v => v.node.id === selectedVariant)?.node;

  const handleAddToCart = async () => {
    if (!product || !variant) return;
    await addItem({
      product: { node: product },
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success(`${product.title} added to cart`);
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 text-center">
        <p className="text-muted-foreground">Product not found</p>
        <Link to="/store" className="text-primary underline mt-4 inline-block">Back to Store</Link>
      </div>
    </div>
  );

  const images = product.images.edges;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleField count={6} />

      <div className="relative z-10 pt-20 sm:pt-24 pb-16 px-3 sm:px-6 max-w-5xl mx-auto">
        <Link to="/store" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 font-body text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </Link>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-10">
          {/* Images */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="glass-surface rounded-xl overflow-hidden aspect-square mb-3">
              {images[selectedImage] ? (
                <img src={images[selectedImage].node.url} alt={images[selectedImage].node.altText || product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)} className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${i === selectedImage ? 'border-primary' : 'border-transparent'}`}>
                    <img src={img.node.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-black tracking-wider text-foreground mb-2">{product.title}</h1>
              <p className="font-display text-xl sm:text-2xl text-primary">
                {variant?.price.currencyCode} {parseFloat(variant?.price.amount || "0").toFixed(2)}
              </p>
            </div>

            <p className="text-sm text-muted-foreground font-body leading-relaxed">{product.description}</p>

            {/* Variant selection */}
            {product.options.map((option) => (
              <div key={option.name}>
                <label className="text-xs font-display tracking-wider text-muted-foreground mb-2 block">{option.name.toUpperCase()}</label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.edges
                    .filter(v => v.node.selectedOptions.some(o => o.name === option.name))
                    .map((v) => {
                      const optValue = v.node.selectedOptions.find(o => o.name === option.name)?.value;
                      return (
                        <button
                          key={v.node.id}
                          onClick={() => setSelectedVariant(v.node.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-body transition-all ${
                            selectedVariant === v.node.id
                              ? "bg-primary/10 text-primary border border-primary/40"
                              : "glass-surface text-muted-foreground hover:text-foreground"
                          } ${!v.node.availableForSale ? 'opacity-40 cursor-not-allowed' : ''}`}
                          disabled={!v.node.availableForSale}
                        >
                          {optValue}
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}

            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={isCartLoading || !variant?.availableForSale}
                variant="outline"
                className="flex-1 font-display tracking-wider"
                size="lg"
              >
                {isCartLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ShoppingCart className="w-4 h-4 mr-2" />Add to Cart</>}
              </Button>
              <Button
                onClick={async () => {
                  await handleAddToCart();
                  const url = useCartStore.getState().getCheckoutUrl();
                  if (url) window.open(url, '_blank');
                }}
                disabled={isCartLoading || !variant?.availableForSale}
                className="flex-1 glow-primary font-display tracking-wider"
                size="lg"
              >
                {isCartLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Buy Now</>}
              </Button>
            </div>

            {/* Payment trust badges */}
            <div className="flex items-center justify-center gap-3 pt-1">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span className="bg-muted/50 px-2 py-0.5 rounded font-semibold">VISA</span>
                <span className="bg-muted/50 px-2 py-0.5 rounded font-semibold">Mastercard</span>
                <span className="bg-muted/50 px-2 py-0.5 rounded font-semibold">PayPal</span>
              </div>
            </div>

            {variant && !variant.availableForSale && (
              <p className="text-sm text-destructive font-body text-center">This variant is currently out of stock</p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
