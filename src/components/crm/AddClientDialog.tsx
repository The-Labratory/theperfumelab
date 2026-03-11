import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";

interface AddClientForm {
  email: string;
  account_type: string;
  notes: string;
}

interface AddClientDialogProps {
  onAdd: (form: AddClientForm) => Promise<void>;
}

export function AddClientDialog({ onAdd }: AddClientDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<AddClientForm>({ email: "", account_type: "B2C", notes: "" });
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    setSaving(true);
    await onAdd(form);
    setSaving(false);
    setForm({ email: "", account_type: "B2C", notes: "" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5 text-xs">
          <UserPlus className="w-3.5 h-3.5" />
          Add Client
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display tracking-wider">Lock New Client</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            placeholder="Client email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          />
          <Select
            value={form.account_type}
            onValueChange={(v) => setForm((p) => ({ ...p, account_type: v }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="B2C">B2C Retail</SelectItem>
              <SelectItem value="B2B_Corporate">B2B Corporate</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          />
          <Button onClick={handleAdd} className="w-full" disabled={saving}>
            {saving ? "Locking…" : "Lock Client"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
