import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useResources, useCreateResource, useDeleteResource } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, ExternalLink, FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/resources")({
  head: () => ({ meta: [{ title: "Resources — Study Hub" }] }),
  component: ResourcesPage,
});

function ResourcesPage() {
  const resources = useResources().data ?? [];
  const del = useDeleteResource();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");

  const filtered = resources.filter(
    (r) =>
      r.subject.toLowerCase().includes(filter.toLowerCase()) ||
      r.tags.some((t) => t.toLowerCase().includes(filter.toLowerCase())),
  );

  return (
    <AppShell
      title="Resource Center"
      description="One place for slides, repos, and study notes."
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="size-4" />
              Add resource
            </Button>
          </DialogTrigger>
          <ResourceForm onSubmitted={() => setOpen(false)} />
        </Dialog>
      }
    >
      <Input
        placeholder="Filter by subject or tag…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="bg-surface-1 border-border h-9 max-w-sm mb-4"
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((r) => (
          <Card key={r.id} className="bg-card border-border p-4 group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-md bg-surface-2 grid place-items-center">
                  <FileText className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-sm font-medium">{r.subject}</div>
                </div>
              </div>
              <button
                onClick={() => del.mutate(r.id, { onSuccess: () => toast("Removed") })}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-priority-high transition"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-3 line-clamp-2 min-h-[2rem]">{r.note}</p>
            <div className="flex flex-wrap gap-1 mt-3">
              {r.tags.map((t) => (
                <Badge key={t} variant="outline" className="text-[10px] font-normal border-border/60">
                  {t}
                </Badge>
              ))}
            </div>
            <a
              href={r.fileLink}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="size-3" /> Open
            </a>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}

function ResourceForm({ onSubmitted }: { onSubmitted: () => void }) {
  const create = useCreateResource();
  const [subject, setSubject] = useState("");
  const [fileLink, setFileLink] = useState("");
  const [note, setNote] = useState("");
  const [tags, setTags] = useState("");

  const submit = () => {
    if (!subject.trim() || !fileLink.trim()) {
      toast.error("Subject and link are required");
      return;
    }
    create.mutate(
      {
        subject: subject.trim(),
        fileLink: fileLink.trim(),
        note: note.trim(),
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      },
      {
        onSuccess: () => {
          toast.success("Resource added");
          onSubmitted();
        },
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  return (
    <DialogContent className="bg-card border-border">
      <DialogHeader>
        <DialogTitle>Add resource</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <div>
          <Label className="text-xs">Subject</Label>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="PRJ301" className="bg-surface-1 border-border mt-1" />
        </div>
        <div>
          <Label className="text-xs">File link</Label>
          <Input value={fileLink} onChange={(e) => setFileLink(e.target.value)} placeholder="https://…" className="bg-surface-1 border-border mt-1" />
        </div>
        <div>
          <Label className="text-xs">Note</Label>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} className="bg-surface-1 border-border mt-1" />
        </div>
        <div>
          <Label className="text-xs">Tags (comma separated)</Label>
          <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Java, JSP" className="bg-surface-1 border-border mt-1" />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={submit} disabled={create.isPending}>
          {create.isPending ? "Adding…" : "Add"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
