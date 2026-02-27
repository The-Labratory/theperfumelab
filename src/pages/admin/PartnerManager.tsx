import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check, X, Eye, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function PartnerManager() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<any>(null);

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["partner-applications"],
    queryFn: async () => {
      const { data, error } = await supabase.from("partner_applications").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("partner_applications").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-applications"] });
      toast.success("Status updated");
    },
  });

  const statusColor = (s: string) => {
    if (s === "approved") return "default";
    if (s === "rejected") return "destructive";
    return "secondary";
  };

  if (isLoading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-foreground">{t("partners.title")}</h1>

      {applications.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t("partners.noApplications")}</p>
      ) : (
        <div className="rounded-lg border border-border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("partners.company")}</TableHead>
                <TableHead>{t("partners.contact")}</TableHead>
                <TableHead>{t("partners.email")}</TableHead>
                <TableHead>{t("partners.type")}</TableHead>
                <TableHead>{t("partners.status")}</TableHead>
                <TableHead>{t("partners.date")}</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.company_name}</TableCell>
                  <TableCell>{app.contact_name}</TableCell>
                  <TableCell className="text-xs">{app.email}</TableCell>
                  <TableCell>{app.business_type || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={statusColor(app.status)}>{t(`partners.${app.status}`)}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{format(new Date(app.created_at), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelected(app)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader><DialogTitle>{app.company_name}</DialogTitle></DialogHeader>
                          <div className="space-y-3 text-sm">
                            <div><span className="text-muted-foreground">{t("partners.contact")}:</span> {app.contact_name}</div>
                            <div><span className="text-muted-foreground">{t("partners.email")}:</span> {app.email}</div>
                            {app.phone && <div><span className="text-muted-foreground">{t("partners.phone")}:</span> {app.phone}</div>}
                            {app.website && (
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">{t("partners.website")}:</span>
                                <a href={app.website} target="_blank" rel="noopener noreferrer" className="text-primary underline flex items-center gap-1">
                                  {app.website} <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                            {app.business_type && <div><span className="text-muted-foreground">{t("partners.type")}:</span> {app.business_type}</div>}
                            {app.estimated_volume && <div><span className="text-muted-foreground">{t("partners.volume")}:</span> {app.estimated_volume}</div>}
                            {app.message && <div><span className="text-muted-foreground">{t("partners.message")}:</span><p className="mt-1 text-foreground">{app.message}</p></div>}
                          </div>
                        </DialogContent>
                      </Dialog>
                      {app.status === "pending" && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500 hover:text-green-400" onClick={() => updateStatus.mutate({ id: app.id, status: "approved" })}>
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => updateStatus.mutate({ id: app.id, status: "rejected" })}>
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
