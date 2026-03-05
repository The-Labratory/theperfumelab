import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { playCelebrationChime } from "@/components/affiliate/celebrationSound";

const AOV = 45; // Average order value in EUR

function playKachingSound() {
  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // Cash register "ka-ching" — two metallic hits + shimmer
    const freqs = [1318.5, 1760, 2637];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + i * 0.06);
      gain.gain.linearRampToValueAtTime(0.18, now + i * 0.06 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.3);
    });

    // Coin shimmer
    const shimmer = ctx.createOscillator();
    const shimmerGain = ctx.createGain();
    shimmer.type = "sine";
    shimmer.frequency.value = 3520;
    shimmerGain.gain.setValueAtTime(0, now + 0.15);
    shimmerGain.gain.linearRampToValueAtTime(0.06, now + 0.18);
    shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    shimmer.connect(shimmerGain);
    shimmerGain.connect(ctx.destination);
    shimmer.start(now + 0.15);
    shimmer.stop(now + 0.65);
  } catch {
    // silent fail
  }
}

export function useRealtimeSaleNotifications(affiliateId: string | null) {
  const nodeMapRef = useRef<Map<string, string>>(new Map());

  // Preload pyramid node names for this affiliate's tree
  useEffect(() => {
    if (!affiliateId) return;

    const loadNodes = async () => {
      const { data } = await supabase
        .from("affiliate_pyramid")
        .select("id, name")
        .order("level");
      if (data) {
        const map = new Map<string, string>();
        data.forEach((n) => map.set(n.id, n.name));
        nodeMapRef.current = map;
      }
    };
    loadNodes();
  }, [affiliateId]);

  useEffect(() => {
    if (!affiliateId) return;

    const channel = supabase
      .channel("affiliate-sales-live")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "affiliate_sales",
        },
        (payload) => {
          const sale = payload.new as {
            id: string;
            pyramid_node_id: string;
            user_id: string;
            notes: string | null;
            created_at: string;
          };

          const agentName =
            nodeMapRef.current.get(sale.pyramid_node_id) || "A team member";
          const estimatedCommission = (AOV * 0.1).toFixed(2); // 10% base

          // Play the ka-ching sound
          playKachingSound();

          // Show rich toast
          toast.success(`💰 ${agentName} just made a sale!`, {
            description: `Estimated commission: €${estimatedCommission}`,
            duration: 6000,
            style: {
              background: "hsl(var(--background))",
              border: "1px solid hsl(var(--primary) / 0.4)",
              boxShadow: "0 0 20px hsl(var(--primary) / 0.15)",
            },
          });

          // After a short delay, play celebration chime for extra delight
          setTimeout(() => playCelebrationChime(), 800);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [affiliateId]);
}
