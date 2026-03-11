import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Loader2, Sparkles } from "lucide-react";
import DOMPurify from "dompurify";
import { toast } from "sonner";

interface ClientPitchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pitch: string;
  businessName: string;
  loading: boolean;
}

function renderMarkdown(md: string) {
  // Simple markdown → HTML for display
  return md
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-display font-bold text-foreground mt-4 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-display font-bold text-foreground mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-lg font-display font-black text-foreground mt-6 mb-2">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split("|").filter(Boolean).map(c => c.trim());
      return `<div class="grid grid-cols-${cells.length} gap-2 text-xs py-1 border-b border-border/20">${cells.map(c => `<span>${c}</span>`).join("")}</div>`;
    })
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-xs text-muted-foreground list-disc">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 text-xs text-muted-foreground list-decimal">$1</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

export default function ClientPitchDialog({ open, onOpenChange, pitch, businessName, loading }: ClientPitchDialogProps) {
  const copyPitch = () => {
    navigator.clipboard.writeText(pitch);
    toast.success("Pitch copied to clipboard!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="font-display tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            AI Pitch — {businessName}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground font-body">Crafting your personalized pitch...</p>
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-[55vh] pr-4">
              <div
                className="prose prose-sm dark:prose-invert font-body text-xs leading-relaxed text-muted-foreground"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(renderMarkdown(pitch), {
                    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'strong', 'em', 'li', 'br', 'div', 'span'],
                    ALLOWED_ATTR: ['class'],
                  }),
                }}
              />
            </ScrollArea>
            <div className="flex justify-end gap-2 pt-2 border-t border-border/30">
              <Button size="sm" variant="outline" onClick={copyPitch} className="gap-1.5 text-xs">
                <Copy className="w-3.5 h-3.5" /> Copy Pitch
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
