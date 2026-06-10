import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { type Project } from "@/lib/mock-data";
import { useProjects, useTasks, useCreateProject, useUpdateProject, useDeleteProject } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Users, Calendar } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/projects")({
  head: () => ({ meta: [{ title: "Projects — Study Hub" }] }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const projects = useProjects().data ?? [];
  const tasks = useTasks().data ?? [];
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const [open, setOpen] = useState(false);

  return (
    <AppShell
      title="Projects"
      description="Group work, capstone, and side builds."
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="size-4" />
              New project
            </Button>
          </DialogTrigger>
          <ProjectForm onSubmitted={() => setOpen(false)} />
        </Dialog>
      }
    >
      <div className="grid md:grid-cols-2 gap-4">
        {projects.map((p) => {
          const projTasks = tasks.filter((t) => t.projectId === p.id);
          const done = projTasks.filter((t) => t.status === "Done").length;
          return (
            <Card key={p.id} className="bg-card border-border p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-medium truncate">{p.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>
                </div>
                <button
                  onClick={() => deleteProject.mutate(p.id, { onSuccess: () => toast("Project deleted") })}
                  className="text-muted-foreground hover:text-priority-high"
                  aria-label="Delete"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="tabular-nums">{p.progress}%</span>
                </div>
                <Progress value={p.progress} className="h-1.5" />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={p.progress}
                  onChange={(e) => updateProject.mutate({ id: p.id, patch: { progress: Number(e.target.value) } })}
                  className="w-full mt-2 accent-foreground"
                />
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  {format(new Date(p.startDate), "MMM d")} → {format(new Date(p.endDate), "MMM d")}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="size-3.5" />
                  {p.members.length} members
                </span>
                <span>
                  {done}/{projTasks.length} tasks done
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-3">
                {p.members.map((m) => (
                  <Badge key={m} variant="outline" className="text-[10px] font-normal border-border/60">
                    {m}
                  </Badge>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}

function ProjectForm({ onSubmitted }: { onSubmitted: () => void }) {
  const create = useCreateProject();
  const [p, setP] = useState<Omit<Project, "id">>({
    name: "",
    description: "",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    progress: 0,
    members: [],
  });
  const [membersText, setMembersText] = useState("");

  const submit = () => {
    if (!p.name.trim()) {
      toast.error("Project name required");
      return;
    }
    create.mutate(
      {
        ...p,
        members: membersText.split(",").map((m) => m.trim()).filter(Boolean),
      },
      {
        onSuccess: () => {
          toast.success("Project created");
          onSubmitted();
        },
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  return (
    <DialogContent className="bg-card border-border">
      <DialogHeader>
        <DialogTitle>New project</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <div>
          <Label className="text-xs">Name</Label>
          <Input value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} className="bg-surface-1 border-border mt-1" />
        </div>
        <div>
          <Label className="text-xs">Description</Label>
          <Textarea value={p.description} onChange={(e) => setP({ ...p, description: e.target.value })} className="bg-surface-1 border-border mt-1" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Start</Label>
            <Input type="date" value={p.startDate} onChange={(e) => setP({ ...p, startDate: e.target.value })} className="bg-surface-1 border-border mt-1" />
          </div>
          <div>
            <Label className="text-xs">End</Label>
            <Input type="date" value={p.endDate} onChange={(e) => setP({ ...p, endDate: e.target.value })} className="bg-surface-1 border-border mt-1" />
          </div>
        </div>
        <div>
          <Label className="text-xs">Members (comma separated)</Label>
          <Input value={membersText} onChange={(e) => setMembersText(e.target.value)} placeholder="Minh, Linh, Khoa" className="bg-surface-1 border-border mt-1" />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={submit} disabled={create.isPending}>
          {create.isPending ? "Creating…" : "Create"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
