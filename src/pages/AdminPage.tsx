import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Users, FileText, Droplets, Clock, CheckCircle2,
  XCircle, Shield, LogOut, ChevronDown, ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// ── Local types ───────────────────────────────────────────────────────────────

interface PartnerApp {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  website: string | null;
  business_type: string | null;
  estimated_volume: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

interface WaitlistEntry {
  id: string;
  email: string;
  name: string | null;
  reason: string | null;
  status: string;
  position: number;
  created_at: string;
}

interface BlendStat {
  blend_number: number;
  blend_name: string | null;
  harmony_score: number | null;
  concentration: string;
  note_count: number;
  created_at: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string | null;
  title: string | null;
  status: string;
  approved_by: string | null;
  approved_at: string | null;
  rejection_note: string | null;
  created_at: string;
}

type Tab = "partner_apps" | "waitlist" | "blends" | "employees";

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    approved: "bg-green-500/10 text-green-400 border-green-500/20",
    rejected: "bg-red-500/10 text-red-400 border-red-500/20",
    offboarded: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  };
  return `text-[10px] font-display tracking-wider px-2 py-0.5 rounded border ${
    map[status] ?? "bg-primary/10 text-primary border-primary/20"
  }`;
};

// ── Component ─────────────────────────────────────────────────────────────────

const AdminPage = () => {
  const { user, isAdmin, isSuperAdmin, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>("partner_apps");
  const [partnerApps, setPartnerApps] = useState<PartnerApp[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [blends, setBlends] = useState<BlendStat[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Redirect if not at least admin
  useEffect(() => {
    if (!loading && !isAdmin) navigate("/", { replace: true });
  }, [loading, isAdmin, navigate]);

  const loadTab = useCallback(async (t: Tab) => {
    setDataLoading(true);
    try {
      if (t === "partner_apps") {
        const { data, error } = await supabase
          .from("partner_applications")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);
        if (error) throw error;
        setPartnerApps((data as PartnerApp[]) ?? []);

      } else if (t === "waitlist") {
        const { data, error } = await supabase
          .from("waitlist")
          .select("*")
          .order("position", { ascending: true })
          .limit(200);
        if (error) throw error;
        setWaitlist((data as WaitlistEntry[]) ?? []);

      } else if (t === "blends") {
        const data = await supabase.rpc("get_alltime_leaderboard", { _limit: 50 });
        if (data.error) throw data.error;
        setBlends((data.data as BlendStat[]) ?? []);

      } else if (t === "employees") {
        const { data, error } = await supabase
          .from("employees")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);
        if (error) throw error;
        setEmployees((data as Employee[]) ?? []);
      }
    } catch (e) {
      toast.error("Failed to load data.");
      console.error(e);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) loadTab(tab);
  }, [tab, isAdmin, loadTab]);

  const updatePartnerStatus = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase
      .from("partner_applications")
      .update({ status })
      .eq("id", id);
    if (error) { toast.error("Update failed."); return; }
    toast.success(`Application ${status}.`);
    setPartnerApps(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const updateEmployeeStatus = async (
    id: string,
    status: "approved" | "rejected",
    rejectionNote?: string
  ) => {
    if (!user?.id) {
      toast.error("Authentication error. Please sign in again.");
      return;
    }
    const updates: Partial<Employee> & { approved_at?: string } = { status };
    if (status === "approved") {
      updates.approved_by = user.id;
      updates.approved_at = new Date().toISOString();
    }
    if (status === "rejected" && rejectionNote) {
      updates.rejection_note = rejectionNote;
    }
    const { error } = await supabase.from("employees").update(updates).eq("id", id);
    if (error) { toast.error("Update failed."); return; }
    toast.success(`Employee ${status}.`);
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "partner_apps", label: "Partner Apps", icon: <FileText className="w-3.5 h-3.5" /> },
    { key: "waitlist",    label: "Waitlist",      icon: <Users className="w-3.5 h-3.5" /> },
    { key: "blends",      label: "Blends",        icon: <Droplets className="w-3.5 h-3.5" /> },
    { key: "employees",   label: "Employees",     icon: <Shield className="w-3.5 h-3.5" /> },
  ];

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm animate-pulse font-body">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-primary" />
            <span className="font-display text-sm tracking-wider text-foreground">
              ADMIN
            </span>
            {isSuperAdmin && (
              <span className="text-[10px] font-display tracking-wider px-2 py-0.5 rounded border bg-accent/10 text-accent border-accent/20">
                SUPERADMIN
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-body hidden sm:block">
              {user?.email}
            </span>
            {isSuperAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/superadmin")}
                className="text-xs font-display tracking-wide"
              >
                Super Console
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => { await signOut(); navigate("/auth"); }}
              className="text-xs text-muted-foreground"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" /> Sign out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="font-display text-2xl font-black tracking-wider gradient-text">
            ADMIN DASHBOARD
          </h1>
          <p className="text-xs text-muted-foreground font-body mt-1">
            Manage applications, waitlist, blends, and employees
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-6 flex-wrap">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-display tracking-wide transition-all ${
                tab === t.key
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "glass-surface text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {dataLoading ? (
          <div className="glass-surface rounded-2xl p-12 text-center">
            <p className="text-muted-foreground text-sm font-body animate-pulse">Loading…</p>
          </div>
        ) : (
          <>
            {/* ── Partner Applications ─────────────────────────────────────── */}
            {tab === "partner_apps" && (
              <div className="space-y-3">
                {partnerApps.length === 0 && (
                  <EmptyState icon={<FileText />} label="No partner applications yet." />
                )}
                {partnerApps.map(app => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-surface rounded-xl overflow-hidden"
                  >
                    <div className="p-4 flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-body text-sm text-foreground">
                            {app.company_name}
                          </span>
                          <span className={statusBadge(app.status)}>{app.status}</span>
                        </div>
                        <p className="text-xs text-muted-foreground font-body">
                          {app.contact_name} · {app.email}
                          {app.phone ? ` · ${app.phone}` : ""}
                        </p>
                        {app.business_type && (
                          <p className="text-[10px] text-muted-foreground/60 font-body mt-0.5">
                            {app.business_type}
                            {app.estimated_volume ? ` · ${app.estimated_volume}` : ""}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-muted-foreground font-body flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {fmt(app.created_at)}
                        </span>
                        <button
                          onClick={() => setExpanded(expanded === app.id ? null : app.id)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {expanded === app.id
                            ? <ChevronUp className="w-4 h-4" />
                            : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {expanded === app.id && (
                      <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
                        {app.message && (
                          <p className="text-xs font-body text-muted-foreground italic">
                            "{app.message}"
                          </p>
                        )}
                        {app.website && (
                          <a
                            href={app.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-primary hover:underline font-body"
                          >
                            {app.website}
                          </a>
                        )}
                        {app.status === "pending" && (
                          <div className="flex gap-2 pt-1">
                            <Button
                              size="sm"
                              onClick={() => updatePartnerStatus(app.id, "approved")}
                              className="text-xs font-display tracking-wide bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20"
                              variant="outline"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => updatePartnerStatus(app.id, "rejected")}
                              variant="outline"
                              className="text-xs font-display tracking-wide text-destructive border-destructive/30 hover:bg-destructive/10"
                            >
                              <XCircle className="w-3.5 h-3.5 mr-1.5" /> Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {/* ── Waitlist ──────────────────────────────────────────────────── */}
            {tab === "waitlist" && (
              <div className="glass-surface rounded-2xl overflow-hidden">
                {waitlist.length === 0 && (
                  <EmptyState icon={<Users />} label="Waitlist is empty." />
                )}
                <ScrollArea className="h-[600px]">
                  <table className="w-full text-xs font-body">
                    <thead className="bg-background/60 sticky top-0">
                      <tr className="text-muted-foreground">
                        <th className="text-left px-4 py-3 font-display tracking-wider">#</th>
                        <th className="text-left px-4 py-3 font-display tracking-wider">Email</th>
                        <th className="text-left px-4 py-3 font-display tracking-wider hidden sm:table-cell">Name</th>
                        <th className="text-left px-4 py-3 font-display tracking-wider hidden md:table-cell">Date</th>
                        <th className="text-left px-4 py-3 font-display tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {waitlist.map(entry => (
                        <tr
                          key={entry.id}
                          className="border-t border-border/40 hover:bg-primary/5 transition-colors"
                        >
                          <td className="px-4 py-3 text-muted-foreground">{entry.position}</td>
                          <td className="px-4 py-3 text-foreground">{entry.email}</td>
                          <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                            {entry.name ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                            {fmt(entry.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={statusBadge(entry.status)}>{entry.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </div>
            )}

            {/* ── Blends ────────────────────────────────────────────────────── */}
            {tab === "blends" && (
              <div className="glass-surface rounded-2xl overflow-hidden">
                {blends.length === 0 && (
                  <EmptyState icon={<Droplets />} label="No blends yet." />
                )}
                <ScrollArea className="h-[600px]">
                  <table className="w-full text-xs font-body">
                    <thead className="bg-background/60 sticky top-0">
                      <tr className="text-muted-foreground">
                        <th className="text-left px-4 py-3 font-display tracking-wider">No.</th>
                        <th className="text-left px-4 py-3 font-display tracking-wider">Name</th>
                        <th className="text-left px-4 py-3 font-display tracking-wider hidden sm:table-cell">Harmony</th>
                        <th className="text-left px-4 py-3 font-display tracking-wider hidden sm:table-cell">Concentration</th>
                        <th className="text-left px-4 py-3 font-display tracking-wider hidden md:table-cell">Notes</th>
                        <th className="text-left px-4 py-3 font-display tracking-wider hidden md:table-cell">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blends.map(b => (
                        <tr
                          key={b.blend_number}
                          className="border-t border-border/40 hover:bg-primary/5 transition-colors"
                        >
                          <td className="px-4 py-3 text-muted-foreground">
                            {String(b.blend_number).padStart(4, "0")}
                          </td>
                          <td className="px-4 py-3 text-foreground">{b.blend_name ?? "—"}</td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <span className="text-primary font-display">{b.harmony_score ?? "—"}</span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{b.concentration}</td>
                          <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{b.note_count}</td>
                          <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{fmt(b.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </div>
            )}

            {/* ── Employees ─────────────────────────────────────────────────── */}
            {tab === "employees" && (
              <div className="space-y-3">
                {employees.length === 0 && (
                  <EmptyState icon={<Shield />} label="No employee records." />
                )}
                {employees.map(emp => (
                  <motion.div
                    key={emp.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-surface rounded-xl overflow-hidden"
                  >
                    <div className="p-4 flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-body text-sm text-foreground">{emp.name}</span>
                          <span className={statusBadge(emp.status)}>{emp.status}</span>
                        </div>
                        <p className="text-xs text-muted-foreground font-body">
                          {emp.email}
                          {emp.title ? ` · ${emp.title}` : ""}
                          {emp.department ? ` · ${emp.department}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-muted-foreground font-body hidden sm:flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {fmt(emp.created_at)}
                        </span>
                        <button
                          onClick={() => setExpanded(expanded === emp.id ? null : emp.id)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {expanded === emp.id
                            ? <ChevronUp className="w-4 h-4" />
                            : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {expanded === emp.id && emp.status === "pending" && (
                      <div className="border-t border-border px-4 pb-4 pt-3 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateEmployeeStatus(emp.id, "approved")}
                          className="text-xs font-display tracking-wide bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20"
                          variant="outline"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => updateEmployeeStatus(emp.id, "rejected")}
                          variant="outline"
                          className="text-xs font-display tracking-wide text-destructive border-destructive/30 hover:bg-destructive/10"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1.5" /> Reject
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ── Empty state helper ─────────────────────────────────────────────────────────

const EmptyState = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div className="py-16 text-center">
    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-muted/30 text-muted-foreground mb-3">
      {icon}
    </div>
    <p className="text-sm text-muted-foreground font-body">{label}</p>
  </div>
);

export default AdminPage;
