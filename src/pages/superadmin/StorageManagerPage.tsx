import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HardDrive, Folder, FileIcon, Trash2, Download, RefreshCw, ChevronRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const BUCKETS = ["avatars", "email-assets", "employee-documents"];

export default function StorageManagerPage() {
  const [bucket, setBucket] = useState(BUCKETS[0]);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [path, setPath] = useState("");
  const [deleteFile, setDeleteFile] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage.from(bucket).list(path || "", {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });
      if (error) throw error;
      setFiles(data || []);
    } catch (err: any) {
      toast.error(`Failed to load files: ${err.message}`);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [bucket, path]);

  useEffect(() => { setPath(""); }, [bucket]);
  useEffect(() => { loadFiles(); }, [loadFiles]);

  const navigateToFolder = (folderName: string) => {
    setPath(prev => prev ? `${prev}/${folderName}` : folderName);
  };

  const navigateUp = () => {
    setPath(prev => prev.split("/").slice(0, -1).join("/"));
  };

  const handlePreview = (file: any) => {
    const filePath = path ? `${path}/${file.name}` : file.name;
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    setPreviewUrl(data.publicUrl);
  };

  const handleDownload = async (file: any) => {
    const filePath = path ? `${path}/${file.name}` : file.name;
    const { data, error } = await supabase.storage.from(bucket).download(filePath);
    if (error) { toast.error(error.message); return; }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    if (!deleteFile) return;
    setDeleting(true);
    try {
      const filePath = path ? `${path}/${deleteFile.name}` : deleteFile.name;
      const { error } = await supabase.storage.from(bucket).remove([filePath]);
      if (error) throw error;

      await supabase.from("admin_audit_logs").insert([{
        user_id: (await supabase.auth.getUser()).data.user?.id || "",
        action: "storage_delete",
        entity_type: `storage:${bucket}`,
        entity_id: filePath,
      }]);

      toast.success("File deleted");
      setDeleteFile(null);
      loadFiles();
    } catch (err: any) {
      toast.error(`Delete failed: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const breadcrumbs = path ? path.split("/") : [];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <HardDrive className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-display font-bold text-foreground">Storage Manager</h1>
      </div>

      <div className="glass-surface rounded-xl p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="w-64">
            <Label className="text-xs text-muted-foreground">Bucket</Label>
            <Select value={bucket} onValueChange={setBucket}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {BUCKETS.map(b => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={loadFiles} variant="outline" size="sm" className="gap-1.5">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        </div>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
          <button onClick={() => setPath("")} className="hover:text-foreground transition-colors font-medium">
            {bucket}
          </button>
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              <ChevronRight className="w-3 h-3" />
              <button
                onClick={() => setPath(breadcrumbs.slice(0, i + 1).join("/"))}
                className="hover:text-foreground transition-colors"
              >
                {crumb}
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="glass-surface rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Last Modified</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {path && (
              <TableRow className="cursor-pointer hover:bg-muted/30" onClick={navigateUp}>
                <TableCell className="flex items-center gap-2 text-sm">
                  <Folder className="w-4 h-4 text-muted-foreground" /> ..
                </TableCell>
                <TableCell />
                <TableCell />
                <TableCell />
              </TableRow>
            )}
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
            ) : files.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Empty</TableCell></TableRow>
            ) : (
              files.map((file) => {
                const isFolder = file.id === null;
                return (
                  <TableRow key={file.name} className={isFolder ? "cursor-pointer hover:bg-muted/30" : ""} onClick={isFolder ? () => navigateToFolder(file.name) : undefined}>
                    <TableCell className="flex items-center gap-2 text-sm">
                      {isFolder ? <Folder className="w-4 h-4 text-amber-500" /> : <FileIcon className="w-4 h-4 text-muted-foreground" />}
                      {file.name}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{isFolder ? "—" : formatSize(file.metadata?.size)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {file.updated_at ? new Date(file.updated_at).toLocaleString() : "—"}
                    </TableCell>
                    <TableCell>
                      {!isFolder && (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handlePreview(file); }}>
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleDownload(file); }}>
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteFile(file); }}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={(o) => !o && setPreviewUrl(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>File Preview</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <div className="flex justify-center">
              <img src={previewUrl} alt="Preview" className="max-h-[60vh] rounded-lg object-contain" onError={() => {
                setPreviewUrl(null);
                toast.error("Cannot preview this file type");
              }} />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewUrl(null)}>Close</Button>
            {previewUrl && (
              <Button asChild>
                <a href={previewUrl} target="_blank" rel="noopener noreferrer">Open in New Tab</a>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteFile} onOpenChange={(o) => !o && setDeleteFile(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" /> Delete File
            </DialogTitle>
            <DialogDescription>
              Permanently delete <strong>{deleteFile?.name}</strong> from <strong>{bucket}</strong>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteFile(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>{deleting ? "Deleting…" : "Delete"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
