import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Users, User, Package, Sparkles, Loader2, Tag, FileText } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import type { Note, Concentration } from "@/data/scentNotes";
import { toast } from "sonner";
import PackingSlip, { type PackingSlipData } from "@/components/PackingSlip";

interface SelectedNote extends Note {
  intensity: number;
  warmth: number;
}

interface CreationCheckoutProps {
  selected: SelectedNote[];
  concentration: Concentration;
  volume: number;
  onClose: () => void;
}

type CustomerType = "solo" | "b2b";

// Pricing matrix: base price per volume/concentration combo
// Anchor: 100ml parfum = 79.99€ (original) → 59.99€ (sale)
// Scale down proportionally for smaller volumes & lower concentrations
const PRICE_MATRIX: Record<string, { original: number; sale: number; variantId: string }> = {
  "10-parfum":  { original: 29.98, sale: 21.98, variantId: "gid://shopify/ProductVariant/46594629894482" },
  "10-edp":     { original: 25.98, sale: 19.98, variantId: "gid://shopify/ProductVariant/46594632286546" },
  "10-edt":     { original: 21.98, sale: 15.98, variantId: "gid://shopify/ProductVariant/46594632286546" },
  "30-parfum":  { original: 69.98, sale: 51.98, variantId: "gid://shopify/ProductVariant/46594629894482" },
  "30-edp":     { original: 59.98, sale: 45.98, variantId: "gid://shopify/ProductVariant/46594632286546" },
  "30-edt":     { original: 49.98, sale: 37.98, variantId: "gid://shopify/ProductVariant/46594632286546" },
  "50-parfum":  { original: 99.98, sale: 75.98, variantId: "gid://shopify/ProductVariant/46594629894482" },
  "50-edp":     { original: 89.98, sale: 69.98, variantId: "gid://shopify/ProductVariant/46594632286546" },
  "50-edt":     { original: 79.98, sale: 59.98, variantId: "gid://shopify/ProductVariant/46594632286546" },
  "100-parfum": { original: 159.98, sale: 119.98, variantId: "gid://shopify/ProductVariant/46594665939282" },
  "100-edp":    { original: 139.98, sale: 109.98, variantId: "gid://shopify/ProductVariant/46594665939282" },
  "100-edt":    { original: 119.98, sale: 89.98, variantId: "gid://shopify/ProductVariant/46594665939282" },
};

const B2B_DISCOUNT = 50; // 50% flat discount for B2B

function getPriceKey(volume: number, concentration: Concentration): string {
  return `${volume}-${concentration.id}`;
}

const CreationCheckout = ({ selected, concentration, volume, onClose }: CreationCheckoutProps) => {
  const [customerType, setCustomerType] = useState<CustomerType>("solo");
  const [quantity, setQuantity] = useState(1);
  const [b2bQuantity, setB2bQuantity] = useState(10);
  const [isAdding, setIsAdding] = useState(false);
  const [showSlip, setShowSlip] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const priceKey = getPriceKey(volume, concentration);
  const priceEntry = PRICE_MATRIX[priceKey] ?? { original: 59.99, sale: 59.99, variantId: "" };
  const variantId = priceEntry.variantId;

  const qty = customerType === "b2b" ? b2bQuantity : quantity;
  const discount = customerType === "b2b" ? B2B_DISCOUNT : 0;

  const unitPrice = useMemo(() => {
    const salePrice = priceEntry.sale;
    if (customerType === "b2b") {
      return parseFloat((salePrice * (1 - B2B_DISCOUNT / 100)).toFixed(2));
    }
    return salePrice;
  }, [priceEntry.sale, customerType]);

  const totalPrice = useMemo(() => parseFloat((unitPrice * qty).toFixed(2)), [unitPrice, qty]);
  const savings = useMemo(() => {
    const fullPrice = priceEntry.original * qty;
    const actualPrice = unitPrice * qty;
    return parseFloat((fullPrice - actualPrice).toFixed(2));
  }, [priceEntry.original, unitPrice, qty]);

  const blendSummary = selected.map((n) => n.name).join(", ");

  const handleAddToCart = async () => {
    if (!variantId) {
      toast.error("Variant not available");
      return;
    }
    setIsAdding(true);
    try {
      await addItem({
        product: {
          node: {
            id: `gid://shopify/Product/8443485782354`,
            title: `Custom Blend: ${blendSummary}`,
            description: `Custom ${concentration.name} — ${volume}ml — ${selected.length} notes: ${blendSummary}`,
            handle: "customized-perfume",
            priceRange: { minVariantPrice: { amount: unitPrice.toString(), currencyCode: "EUR" } },
            images: { edges: [] },
            variants: {
              edges: [{
                node: {
                  id: variantId,
                  title: `${volume}ml ${concentration.percentage}`,
                  price: { amount: unitPrice.toString(), currencyCode: "EUR" },
                  availableForSale: true,
                  selectedOptions: [{ name: "Title", value: `${volume}ml ${concentration.percentage}` }],
                },
              }],
            },
            options: [{ name: "Title", values: [`${volume}ml ${concentration.percentage}`] }],
          },
        },
        variantId,
        variantTitle: `${volume}ml ${concentration.percentage}`,
        price: { amount: unitPrice.toString(), currencyCode: "EUR" },
        quantity: qty,
        selectedOptions: [{ name: "Title", value: `${volume}ml ${concentration.percentage}` }],
      });
      toast.success("Custom blend added to cart!", {
        description: `${qty}× ${volume}ml ${concentration.name}`,
      });
      setShowSlip(true);
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="glass-surface rounded-2xl border border-border p-5 sm:p-6 space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base sm:text-lg font-bold tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" /> Order Your Blend
        </h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
      </div>

      {/* Blend summary */}
      <div className="p-3 rounded-xl bg-muted/30 border border-border">
        <p className="text-[10px] font-display tracking-widest text-muted-foreground mb-1">YOUR COMPOSITION</p>
        <p className="text-xs font-body text-foreground leading-relaxed">{blendSummary}</p>
        <p className="text-[10px] text-primary font-display mt-1">
          {concentration.name} • {concentration.percentage} • {volume}ml • {concentration.longevity}
        </p>
      </div>

      {/* Customer type toggle */}
      <div className="flex gap-2">
        {(["solo", "b2b"] as CustomerType[]).map((type) => (
          <button
            key={type}
            onClick={() => setCustomerType(type)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-display text-xs tracking-wider transition-all ${
              customerType === type
                ? "bg-primary text-primary-foreground"
                : "glass-surface text-muted-foreground hover:text-foreground"
            }`}
          >
            {type === "solo" ? <User className="w-4 h-4" /> : <Users className="w-4 h-4" />}
            {type === "solo" ? "Solo" : "B2B / Wholesale"}
          </button>
        ))}
      </div>

      {/* Volume display */}
      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
        <span className="text-xs font-display tracking-wider text-muted-foreground flex items-center gap-2">
          <Package className="w-4 h-4" /> BOTTLE SIZE
        </span>
        <span className="font-display text-sm text-primary">{volume}ml</span>
      </div>

      {/* Quantity */}
      <div>
        <p className="text-[10px] font-display tracking-widest text-muted-foreground mb-2">QUANTITY</p>
        {customerType === "solo" ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 rounded-xl glass-surface text-foreground font-display text-lg hover:bg-primary/10 transition-colors"
            >
              −
            </button>
            <span className="font-display text-xl text-foreground w-10 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(10, quantity + 1))}
              className="w-10 h-10 rounded-xl glass-surface text-foreground font-display text-lg hover:bg-primary/10 transition-colors"
            >
              +
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type="number"
              min={5}
              max={500}
              value={b2bQuantity}
              onChange={(e) => setB2bQuantity(Math.max(5, parseInt(e.target.value) || 5))}
              className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border font-display text-foreground text-center text-lg focus:outline-none focus:border-primary/50"
            />
            <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
              <p className="text-xs font-display text-accent flex items-center gap-1">
                <Tag className="w-3 h-3" /> B2B Partner Discount: {B2B_DISCOUNT}% off all orders
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Price breakdown */}
      <div className="p-4 rounded-xl bg-muted/20 border border-border space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground font-body">Original price</span>
          <span className="text-muted-foreground font-display line-through">€{priceEntry.original.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground font-body">Sale price</span>
          <span className="text-foreground font-display">€{priceEntry.sale.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground font-body flex items-center gap-1">
              <Tag className="w-3 h-3" /> B2B discount
            </span>
            <span className="text-accent font-display">−{discount}%</span>
          </div>
        )}
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground font-body">Unit price</span>
          <span className="text-primary font-display">€{unitPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground font-body">Quantity</span>
          <span className="text-foreground font-display">×{qty}</span>
        </div>
        <div className="border-t border-border pt-2 flex justify-between">
          <span className="font-display text-sm text-foreground">Total</span>
          <span className="font-display text-lg text-primary">€{totalPrice.toFixed(2)}</span>
        </div>
        {savings > 0 && (
          <p className="text-[10px] text-accent font-display text-right">You save €{savings.toFixed(2)}</p>
        )}
      </div>

      {/* Add to cart */}
      <button
        onClick={handleAddToCart}
        disabled={isAdding || selected.length === 0}
        className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display text-sm tracking-wider hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isAdding ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <ShoppingCart className="w-4 h-4" />
            Add to Cart — €{totalPrice.toFixed(2)}
          </>
        )}
      </button>

      {customerType === "b2b" && (
        <p className="text-[10px] text-muted-foreground font-body text-center">
          Want to become a partner? <a href="/partner" className="text-primary hover:underline">Apply here</a> to manage your B2B orders.
        </p>
      )}

      <AnimatePresence>
        {showSlip && (
          <PackingSlip
            data={{
              orderNumber: String(Date.now()).slice(-6),
              date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
              customer: { name: customerType === "b2b" ? "B2B Partner" : "Creator" },
              items: [{
                name: `Custom Blend: ${blendSummary.slice(0, 60)}${blendSummary.length > 60 ? "…" : ""}`,
                variant: `${volume}ml ${concentration.percentage}`,
                quantity: qty,
                unitPrice: unitPrice,
              }],
              blend: {
                blendName: blendSummary,
                concentration: concentration.name,
                volume: `${volume}ml`,
                notes: selected.map(n => n.name),
              },
              subtotal: totalPrice,
              discount: savings > 0 ? savings : undefined,
              total: totalPrice,
              currency: "EUR",
            }}
            onClose={() => { setShowSlip(false); onClose(); }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CreationCheckout;
