import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy } from "lucide-react";
import { maskEmail } from "@/lib/supabase";

export interface ClientConnection {
  id: string;
  client_email: string;
  account_type: string;
  company_name: string | null;
  expected_volume: string | null;
  discount_pct: number;
  checkout_link_code: string;
  last_order_at: string | null;
  total_orders: number;
  total_spent: number;
  acquisition_date: string;
  notes: string | null;
}

function getClientStatus(lastOrderAt: string | null): { label: string; color: string } {
  if (!lastOrderAt) return { label: "New", color: "bg-muted text-muted-foreground" };
  const days = (Date.now() - new Date(lastOrderAt).getTime()) / (1000 * 60 * 60 * 24);
  if (days <= 30) return { label: "Active", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" };
  if (days <= 90) return { label: "At Risk", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" };
  return { label: "Inactive", color: "bg-muted text-muted-foreground border-muted" };
}

interface ClientTableProps {
  clients: ClientConnection[];
  loading: boolean;
  onCopyLink: (code: string) => void;
}

export function ClientTable({ clients, loading, onCopyLink }: ClientTableProps) {
  return (
    <div className="glass-surface rounded-xl border border-border/30 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border/30">
            <TableHead className="text-xs font-display tracking-wider">STATUS</TableHead>
            <TableHead className="text-xs font-display tracking-wider">CLIENT</TableHead>
            <TableHead className="text-xs font-display tracking-wider">TYPE</TableHead>
            <TableHead className="text-xs font-display tracking-wider">ORDERS</TableHead>
            <TableHead className="text-xs font-display tracking-wider">REVENUE</TableHead>
            <TableHead className="text-xs font-display tracking-wider">LINK</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-8">
                Loading...
              </TableCell>
            </TableRow>
          ) : clients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-8">
                No clients yet. Lock your first client above.
              </TableCell>
            </TableRow>
          ) : (
            clients.map((c) => {
              const status = getClientStatus(c.last_order_at);
              return (
                <TableRow key={c.id} className="border-border/20">
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] ${status.color}`}>
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {/* Email masked per Module D data-security policy */}
                    <p className="text-xs font-medium text-foreground">{maskEmail(c.client_email)}</p>
                    {c.company_name && (
                      <p className="text-[10px] text-muted-foreground">{c.company_name}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px]">
                      {c.account_type === "B2B_Corporate" ? "B2B" : "B2C"}
                      {c.discount_pct > 0 && ` · ${c.discount_pct}% off`}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-display font-bold text-foreground">
                    {c.total_orders}
                  </TableCell>
                  <TableCell className="text-xs font-display font-bold text-primary">
                    €{c.total_spent.toFixed(0)}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => onCopyLink(c.checkout_link_code)}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
