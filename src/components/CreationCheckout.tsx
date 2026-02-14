import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Users, User, Package, Sparkles, ChevronDown, Loader2, Tag } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import type { Note, Concentration } from "@/data/scentNotes";
import { toast } from "sonner";

interface SelectedNote extends Note {
  intensity: number;
  warmth: number;
}

interface CreationCheckoutProps {
  selected: SelectedNote[];
  concentration: Concentration;
  onClose: () => void;
}

type CustomerType = "solo" | "b2b";
type BottleSize = "50ml" | "100ml";

interface PriceTier {
  min: number;
  max: number | null;
  label: string;
  discount: number;
}

const B2B_TIERS: PriceTier[] = [
  { min: 5, max: 9, label: "5–9 units", discount: 10 },
  { min: 10, max: 24, label: "10–24 units", discount: 18 },
  { min: 25, max: 49, label: "25–49 units", discount: 25 },
  { min: 50, max: null, label: "50+ units", discount: 32 },
];

// Mapped from actual Shopify "Customized Perfume" variants
const BASE_PRICES: Record<string, { price: number; variantId: string }> = {
  "50ml-parfum": { price: 39.99, variantId: "gid://shopify/ProductVariant/46594629894482" },
  "50ml-edp": { price: 34.99, variantId: "gid://shopify/ProductVariant/46594632286546" },
  "50ml-edt": { price: 34.99, variantId: "gid://shopify/ProductVariant/46594632286546" },
  "100ml-parfum": { price: 64.99, variantId: "gid://shopify/ProductVariant/46594665939282" },
  "100ml-edp": { price: 64.99, variantId: "gid://shopify/ProductVariant/46594665939282" },
  "100ml-edt": { price: 64.99, variantId: "gid://shopify/ProductVariant/46594665939282" },
};

function getVariantKey(size: BottleSize, concentration: Concentration): string {
  return `${size}-${concentration.id}`;
}

function getActiveTier(quantity: number): PriceTier | null {
  return B2B_TIERS.find((t) => quantity >= t.min && (t.max === null || quantity <= t.max)) ?? null;
}

const CreationCheckout = ({ selected, concentration, onClose }: CreationCheckoutProps) => {
  const [customerType, setCustomerType] = useState<CustomerType>("solo");
  const [size, setSize] = useState<BottleSize>("50ml");
  const [quantity, setQuantity] = useState(1);
  const [b2bQuantity, setB2bQuantity] = useState(10);
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const variantKey = getVariantKey(size, concentration);
  const basePrice = BASE_PRICES[variantKey]?.price ?? 39.99;
  const variantId = BASE_PRICES[variantKey]?.variantId ?? "";

  const activeTier = customerType === "b2b" ? getActiveTier(b2bQuantity) : null;
  const discount = activeTier?.discount ?? 0;
  const qty = customerType === "b2b" ? b2bQuantity : quantity;

  const unitPrice = useMemo(() => {
    if (customerType === "b2b" && discount > 0) {
      return parseFloat((basePrice * (1 - discount / 100)).toFixed(2));
    }
    return basePrice;
  }, [basePrice, discount, customerType]);

  const totalPrice = useMemo(() => parseFloat((unitPrice * qty).toFixed(2)), [unitPrice, qty]);
  const savings = useMemo(() => {
    if (discount > 0) return parseFloat(((basePrice - unitPrice) * qty).toFixed(2));
    return 0;
  }, [basePrice, unitPrice, qty, discount]);

  const blendSummary = selected.map((n) => n.name).join(", ");

  const handleAddToCart = async () => {
    if (!variantId) {
      toast.error("Variant not available");
      return;
    }
    setIsAdding(true);
    try {
      // We add the quantity as specified
      await addItem({
        product: {
          node: {
            id: `gid://shopify/Product/8443485782354`,
            title: `Custom Blend: ${blendSummary}`,
            description: `Custom ${concentration.name} — ${size} — ${selected.length} notes: ${blendSummary}`,
            handle: "customized-perfume",
            priceRange: { minVariantPrice: { amount: unitPrice.toString(), currencyCode: "EUR" } },
            images: { edges: [] },
            variants: {
              edges: [{
                node: {
                  id: variantId,
                  title: `${size} ${concentration.percentage}`,
                  price: { amount: unitPrice.toString(), currencyCode: "EUR" },
                  availableForSale: true,
                  selectedOptions: [{ name: "Title", value: `${size} ${concentration.percentage}` }],
                },
              }],
            },
            options: [{ name: "Title", values: [`${size} ${concentration.percentage}`] }],
          },
        },
        variantId,
        variantTitle: `${size} ${concentration.percentage}`,
        price: { amount: unitPrice.toString(), currencyCode: "EUR" },
        quantity: qty,
        selectedOptions: [{ name: "Title", value: `${size} ${concentration.percentage}` }],
      });
      toast.success("Custom blend added to cart!", {
        description: `${qty}× ${size} ${concentration.name}`,
      });
      onClose();
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
        <p className="text-[10px] text-primary font-display mt-1">{concentration.name} • {concentration.percentage} • {concentration.longevity}</p>
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

      {/* Size selector */}
      <div>
        <p className="text-[10px] font-display tracking-widest text-muted-foreground mb-2">BOTTLE SIZE</p>
        <div className="flex gap-2">
          {(["50ml", "100ml"] as BottleSize[]).map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`flex-1 py-3 rounded-xl font-display text-sm tracking-wider transition-all flex items-center justify-center gap-2 ${
                size === s
                  ? "bg-primary/10 border border-primary/40 text-primary"
                  : "glass-surface text-muted-foreground hover:text-foreground"
              }`}
            >
              <Package className="w-4 h-4" />
              {s}
            </button>
          ))}
        </div>
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
            {/* B2B tier table */}
            <div className="space-y-1.5">
              {B2B_TIERS.map((tier) => {
                const isActive = activeTier === tier;
                return (
                  <div
                    key={tier.label}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
                      isActive
                        ? "bg-primary/10 border border-primary/30 text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    <span className="font-body">{tier.label}</span>
                    <span className="font-display">{tier.discount}% off</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Price breakdown */}
      <div className="p-4 rounded-xl bg-muted/20 border border-border space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground font-body">Unit price</span>
          <span className="text-foreground font-display">€{unitPrice.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground font-body flex items-center gap-1">
              <Tag className="w-3 h-3" /> B2B discount
            </span>
            <span className="text-emerald-400 font-display">−{discount}%</span>
          </div>
        )}
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground font-body">Quantity</span>
          <span className="text-foreground font-display">×{qty}</span>
        </div>
        <div className="border-t border-border pt-2 flex justify-between">
          <span className="font-display text-sm text-foreground">Total</span>
          <span className="font-display text-lg text-primary">€{totalPrice.toFixed(2)}</span>
        </div>
        {savings > 0 && (
          <p className="text-[10px] text-emerald-400 font-display text-right">You save €{savings.toFixed(2)}</p>
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
          B2B orders above 50 units? Contact us for custom pricing and private-label options.
        </p>
      )}
    </motion.div>
  );
};

export default CreationCheckout;
