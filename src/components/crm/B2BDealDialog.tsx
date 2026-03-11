import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building2 } from "lucide-react";

interface B2BDealForm {
  email: string;
  company: string;
  volume: string;
  discount: string;
}

interface B2BDealDialogProps {
  onAdd: (form: B2BDealForm) => Promise<void>;
}

export function B2BDealDialog({ onAdd }: B2BDealDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<B2BDealForm>({ email: "", company: "", volume: "", discount: "20" });
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    setSaving(true);
    await onAdd(form);
    setSaving(false);
    setForm({ email: "", company: "", volume: "", discount: "20" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5 text-xs">
          <Building2 className="w-3.5 h-3.5" />
          B2B Deal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display tracking-wider">B2B Deal Builder</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            placeholder="Contact email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          />
          <Input
            placeholder="Company name"
            value={form.company}
            onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
          />
          <Input
            placeholder="Expected volume (e.g. 200 units/month)"
            value={form.volume}
            onChange={(e) => setForm((p) => ({ ...p, volume: e.target.value }))}
          />
          <div>
            <label className="text-xs font-display text-muted-foreground mb-1 block">
              Discount % (max 40%)
            </label>
            <Input
              type="number"
              min={0}
              max={40}
              value={form.discount}
              onChange={(e) => setForm((p) => ({ ...p, discount: e.target.value }))}
            />
          </div>
          <div className="rounded-lg bg-accent/10 p-3 text-xs text-accent font-body">
            <p className="font-bold">Commission: 10–20% on B2B orders</p>
            <p className="text-muted-foreground mt-1">
              A unique pre-negotiated checkout link will be generated automatically.
            </p>
          </div>
          <Button onClick={handleAdd} className="w-full" disabled={saving}>
            {saving ? "Creating…" : "Create Deal & Generate Link"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
