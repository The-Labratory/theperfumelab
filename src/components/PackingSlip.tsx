import { useRef } from "react";
import { motion } from "framer-motion";
import { Printer, Download, X, Package, Droplets, Hash, Calendar, User, MapPin, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PackingSlipItem {
  name: string;
  variant?: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export interface PackingSlipBlend {
  blendNumber?: number;
  blendName?: string;
  concentration?: string;
  volume?: string;
  notes?: string[];
  harmonyScore?: number;
}

export interface PackingSlipData {
  orderNumber: string;
  date: string;
  customer: {
    name: string;
    email?: string;
    address?: string;
  };
  items: PackingSlipItem[];
  blend?: PackingSlipBlend;
  subtotal: number;
  discount?: number;
  shipping?: number;
  total: number;
  currency?: string;
  notes?: string;
}

interface PackingSlipProps {
  data: PackingSlipData;
  onClose: () => void;
}

const PackingSlip = ({ data, onClose }: PackingSlipProps) => {
  const slipRef = useRef<HTMLDivElement>(null);
  const currency = data.currency ?? "EUR";
  const sym = currency === "EUR" ? "€" : "$";

  const handlePrint = () => {
    const content = slipRef.current;
    if (!content) return;
    const win = window.open("", "_blank", "width=800,height=1100");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html><head><title>Packing Slip #${data.orderNumber}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Orbitron:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Inter',sans-serif;color:#1a1a2e;padding:40px;background:#fff}
        .slip{max-width:680px;margin:0 auto}
        .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #1a1a2e;padding-bottom:20px;margin-bottom:24px}
        .brand{font-family:'Orbitron',monospace;font-size:18px;font-weight:700;letter-spacing:2px;color:#1a1a2e}
        .brand-sub{font-size:10px;letter-spacing:4px;color:#666;margin-top:4px}
        .order-badge{text-align:right}
        .order-badge .label{font-size:9px;letter-spacing:3px;color:#888;text-transform:uppercase}
        .order-badge .value{font-family:'Orbitron',monospace;font-size:16px;font-weight:600;color:#1a1a2e}
        .meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:28px}
        .meta-box{padding:14px;border:1px solid #e5e5e5;border-radius:8px}
        .meta-title{font-size:9px;letter-spacing:3px;color:#888;text-transform:uppercase;margin-bottom:6px}
        .meta-value{font-size:13px;color:#1a1a2e;line-height:1.5}
        .blend-card{background:linear-gradient(135deg,#f0f9ff,#faf5ff);border:1px solid #e0e7ff;border-radius:10px;padding:18px;margin-bottom:24px}
        .blend-header{font-family:'Orbitron',monospace;font-size:11px;letter-spacing:3px;color:#6366f1;margin-bottom:10px;text-transform:uppercase}
        .blend-name{font-size:16px;font-weight:600;color:#1a1a2e;margin-bottom:4px}
        .blend-meta{font-size:11px;color:#666;margin-bottom:8px}
        .blend-notes{display:flex;flex-wrap:wrap;gap:6px}
        .blend-note{background:#fff;border:1px solid #d4d4d8;border-radius:20px;padding:3px 10px;font-size:10px;color:#444}
        table{width:100%;border-collapse:collapse;margin-bottom:24px}
        th{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#888;text-align:left;padding:8px 12px;border-bottom:1px solid #e5e5e5}
        td{padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:12px;color:#333}
        td:last-child,th:last-child{text-align:right}
        .totals{display:flex;justify-content:flex-end;margin-bottom:28px}
        .totals-inner{width:240px}
        .total-row{display:flex;justify-content:space-between;padding:5px 0;font-size:12px;color:#666}
        .total-row.grand{border-top:2px solid #1a1a2e;padding-top:10px;margin-top:6px;font-size:15px;font-weight:700;color:#1a1a2e}
        .footer{border-top:1px solid #e5e5e5;padding-top:16px;text-align:center}
        .footer p{font-size:10px;color:#999;line-height:1.8;letter-spacing:1px}
        .footer .tagline{font-family:'Orbitron',monospace;font-size:9px;letter-spacing:4px;color:#6366f1;margin-top:8px}
        .qr-placeholder{width:60px;height:60px;border:1px dashed #ccc;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:8px;color:#aaa;margin:0 auto 8px}
        @media print{body{padding:20px}@page{margin:15mm}}
      </style></head><body>
      <div class="slip">${content.innerHTML}</div>
      </body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white text-[hsl(var(--background))] rounded-2xl shadow-2xl max-w-[720px] w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Toolbar */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 bg-white/95 backdrop-blur-sm border-b border-gray-100 rounded-t-2xl">
          <span className="font-display text-xs tracking-[0.2em] text-gray-500 uppercase">Packing Slip Preview</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handlePrint} className="gap-1.5 text-gray-700 border-gray-200 hover:bg-gray-50">
              <Printer className="w-3.5 h-3.5" /> Print
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose} className="text-gray-500 hover:text-gray-800">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Slip Content */}
        <div ref={slipRef} className="p-8 sm:p-10">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-[#1a1a2e] pb-5 mb-6">
            <div>
              <h1 className="font-display text-lg font-bold tracking-[0.15em] text-[#1a1a2e]">THE PERFUME LAB</h1>
              <p className="text-[10px] tracking-[0.3em] text-gray-500 mt-1">ARTISANAL PERFUMERY</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] tracking-[0.2em] text-gray-400 uppercase">Order</p>
              <p className="font-display text-base font-semibold text-[#1a1a2e]">#{data.orderNumber}</p>
            </div>
          </div>

          {/* Meta Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-3.5 border border-gray-200 rounded-lg">
              <p className="text-[9px] tracking-[0.2em] text-gray-400 uppercase mb-1.5 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Date
              </p>
              <p className="text-[13px] text-[#1a1a2e]">{data.date}</p>
            </div>
            <div className="p-3.5 border border-gray-200 rounded-lg">
              <p className="text-[9px] tracking-[0.2em] text-gray-400 uppercase mb-1.5 flex items-center gap-1">
                <User className="w-3 h-3" /> Customer
              </p>
              <p className="text-[13px] text-[#1a1a2e] font-medium">{data.customer.name}</p>
              {data.customer.email && <p className="text-[11px] text-gray-500">{data.customer.email}</p>}
            </div>
            {data.customer.address && (
              <div className="p-3.5 border border-gray-200 rounded-lg col-span-2">
                <p className="text-[9px] tracking-[0.2em] text-gray-400 uppercase mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Shipping Address
                </p>
                <p className="text-[13px] text-[#1a1a2e] leading-relaxed">{data.customer.address}</p>
              </div>
            )}
          </div>

          {/* Blend Card */}
          {data.blend && (
            <div className="bg-gradient-to-br from-[#f0f9ff] to-[#faf5ff] border border-[#e0e7ff] rounded-xl p-4 mb-6">
              <p className="font-display text-[11px] tracking-[0.2em] text-indigo-500 uppercase mb-2 flex items-center gap-1.5">
                <FlaskConical className="w-3.5 h-3.5" /> Custom Creation
              </p>
              {data.blend.blendNumber && (
                <p className="text-[10px] text-gray-400 flex items-center gap-1 mb-1">
                  <Hash className="w-3 h-3" /> Blend No. {String(data.blend.blendNumber).padStart(4, "0")}
                </p>
              )}
              {data.blend.blendName && (
                <p className="text-base font-semibold text-[#1a1a2e] mb-1">{data.blend.blendName}</p>
              )}
              <p className="text-[11px] text-gray-500 mb-2.5 flex items-center gap-2">
                {data.blend.concentration && <span className="flex items-center gap-1"><Droplets className="w-3 h-3" />{data.blend.concentration}</span>}
                {data.blend.volume && <span>• {data.blend.volume}</span>}
                {data.blend.harmonyScore != null && <span>• Harmony {data.blend.harmonyScore}%</span>}
              </p>
              {data.blend.notes && data.blend.notes.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {data.blend.notes.map((n, i) => (
                    <span key={i} className="bg-white border border-gray-200 rounded-full px-2.5 py-0.5 text-[10px] text-gray-600">{n}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Items Table */}
          <table className="w-full border-collapse mb-6">
            <thead>
              <tr>
                <th className="text-[9px] tracking-[0.15em] uppercase text-gray-400 text-left pb-2 border-b border-gray-200 px-3 py-2">Item</th>
                <th className="text-[9px] tracking-[0.15em] uppercase text-gray-400 text-left pb-2 border-b border-gray-200 px-3 py-2">Variant</th>
                <th className="text-[9px] tracking-[0.15em] uppercase text-gray-400 text-center pb-2 border-b border-gray-200 px-3 py-2">Qty</th>
                <th className="text-[9px] tracking-[0.15em] uppercase text-gray-400 text-right pb-2 border-b border-gray-200 px-3 py-2">Price</th>
                <th className="text-[9px] tracking-[0.15em] uppercase text-gray-400 text-right pb-2 border-b border-gray-200 px-3 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="px-3 py-2.5 text-[12px] text-[#1a1a2e] font-medium">{item.name}</td>
                  <td className="px-3 py-2.5 text-[11px] text-gray-500">{item.variant || "—"}</td>
                  <td className="px-3 py-2.5 text-[12px] text-[#1a1a2e] text-center">{item.quantity}</td>
                  <td className="px-3 py-2.5 text-[12px] text-gray-600 text-right">{sym}{item.unitPrice.toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-[12px] text-[#1a1a2e] font-medium text-right">{sym}{(item.unitPrice * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-7">
            <div className="w-60">
              <div className="flex justify-between py-1 text-[12px] text-gray-500">
                <span>Subtotal</span>
                <span>{sym}{data.subtotal.toFixed(2)}</span>
              </div>
              {(data.discount ?? 0) > 0 && (
                <div className="flex justify-between py-1 text-[12px] text-green-600">
                  <span>Discount</span>
                  <span>−{sym}{data.discount!.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between py-1 text-[12px] text-gray-500">
                <span>Shipping</span>
                <span>{data.shipping ? `${sym}${data.shipping.toFixed(2)}` : "Free"}</span>
              </div>
              <div className="flex justify-between pt-2.5 mt-1.5 border-t-2 border-[#1a1a2e] text-[15px] font-bold text-[#1a1a2e]">
                <span>Total</span>
                <span>{sym}{data.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {data.notes && (
            <div className="p-3 bg-gray-50 rounded-lg mb-6">
              <p className="text-[9px] tracking-[0.2em] text-gray-400 uppercase mb-1">Order Notes</p>
              <p className="text-[11px] text-gray-600 leading-relaxed">{data.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-gray-200 pt-4 text-center">
            <p className="text-[10px] text-gray-400 leading-[1.8] tracking-[0.05em]">
              Hand-blended in our atelier · IFRA compliant · EU regulation 1223/2009
            </p>
            <p className="text-[10px] text-gray-400 leading-[1.8] tracking-[0.05em]">
              Keep away from direct sunlight · Store in a cool, dry place
            </p>
            <p className="font-display text-[9px] tracking-[0.3em] text-indigo-500 mt-2">
              CRAFTED WITH PRECISION — THE PERFUME LAB
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PackingSlip;
