import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Eye, Ban, RefreshCw, Download } from "lucide-react";
import { toast } from "sonner";

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  experience_level: string | null;
  blends_created: number | null;
  total_likes_received: number | null;
  is_public: boolean | null;
  created_at: string;
  team_id: string | null;
}

export default function CustomersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProfiles(); }, []);

  const loadProfiles = async () => {
    setLoading(true);
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setProfiles(data || []);
    setLoading(false);
  };

  const filtered = profiles.filter(p =>
    (p.display_name || "").toLowerCase().includes(search.toLowerCase()) ||
    p.user_id.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const headers = ["User ID", "Display Name", "Level", "Blends", "Likes", "Joined"];
    const rows = filtered.map(p => [
      p.user_id, p.display_name || "", p.experience_level || "", p.blends_created || 0, p.total_likes_received || 0, p.created_at,
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "customers.csv"; a.click();
    toast.success("Exported customers CSV");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-display font-bold text-foreground">Customers</h1>
          <Badge variant="secondary">{profiles.length}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadProfiles}><RefreshCw className="w-4 h-4" /></Button>
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="w-4 h-4 mr-1" /> CSV</Button>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by name or user ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="glass-surface rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Blends</TableHead>
              <TableHead>Likes</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No customers found</TableCell></TableRow>
            ) : filtered.map(p => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {p.avatar_url && <img src={p.avatar_url} className="w-8 h-8 rounded-full" alt="" />}
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.display_name || "Anonymous"}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{p.user_id.slice(0, 8)}...</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">{p.experience_level || "beginner"}</Badge>
                </TableCell>
                <TableCell className="text-sm">{p.blends_created || 0}</TableCell>
                <TableCell className="text-sm">{p.total_likes_received || 0}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" title="View details"><Eye className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
