import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import {
  CATEGORIES,
  PRIORITIES,
  STATUSES,
  categoryColor,
  priorityColor,
  type Category,
  type Priority,
  type Status,
  type Task,
} from "@/lib/mock-data";
import { useTasks, useProjects, useCreateTask, useUpdateTask, useDeleteTask } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { format, isPast, isToday } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/tasks")({
  head: () => ({ meta: [{ title: "Tasks — Study Hub" }] }),
  component: TasksPage,
});

function TasksPage() {
  const tasks = useTasks().data ?? [];
  const projects = useProjects().data ?? [];
  const [query, setQuery] = useState("");
  const [filterCat, setFilterCat] = useState<Category | "All">("All");
  const [filterStatus, setFilterStatus] = useState<Status | "All">("All");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(
    () =>
      tasks
        .filter((t) => (filterCat === "All" ? true : t.category === filterCat))
        .filter((t) => (filterStatus === "All" ? true : t.status === filterStatus))
        .filter((t) => t.title.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => +new Date(a.deadline) - +new Date(b.deadline)),
    [tasks, filterCat, filterStatus, query],
  );

  return (
    <AppShell
      title="Tasks"
      description="Capture everything. Ship in priority order."
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="size-4" />
              New task
            </Button>
          </DialogTrigger>
          <TaskFormDialog onSubmitted={() => setOpen(false)} projects={projects} />
        </Dialog>
      }
    >
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search tasks…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8 bg-surface-1 border-border h-9"
          />
        </div>
        <Select value={filterCat} onValueChange={(v) => setFilterCat(v as Category | "All")}>
          <SelectTrigger className="w-[160px] bg-surface-1 border-border h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as Status | "All")}>
          <SelectTrigger className="w-[140px] bg-surface-1 border-border h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All status</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-card border-border overflow-hidden">
        <div className="grid grid-cols-[24px_1fr_120px_120px_120px_32px] gap-3 px-4 py-2.5 text-[11px] uppercase tracking-wide text-muted-foreground border-b border-border bg-surface-1">
          <div></div>
          <div>Task</div>
          <div>Category</div>
          <div>Status</div>
          <div>Deadline</div>
          <div></div>
        </div>
        {filtered.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-12">No tasks.</div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((t) => (
              <TaskItem key={t.id} task={t} />
            ))}
          </ul>
        )}
      </Card>
    </AppShell>
  );
}

function TaskItem({ task }: { task: Task }) {
  const update = useUpdateTask();
  const del = useDeleteTask();
  const d = new Date(task.deadline);
  const overdue = task.status !== "Done" && isPast(d) && !isToday(d);
  return (
    <li className="grid grid-cols-[24px_1fr_120px_120px_120px_32px] gap-3 px-4 py-2.5 items-center hover:bg-surface-1/50 group">
      <span className="size-2 rounded-full" style={{ background: priorityColor(task.priority) }} title={task.priority} />
      <div className="min-w-0">
        <div className="text-sm truncate">{task.title}</div>
        {task.description && <div className="text-xs text-muted-foreground truncate">{task.description}</div>}
      </div>
      <div>
        <Badge variant="outline" className="text-[10px] font-normal" style={{ color: categoryColor(task.category) }}>
          {task.category}
        </Badge>
      </div>
      <Select
        value={task.status}
        onValueChange={(v) => update.mutate({ id: task.id, patch: { status: v as Status } })}
      >
        <SelectTrigger className="h-7 text-xs bg-transparent border-border/60 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className={`text-xs tabular-nums ${overdue ? "text-priority-high" : "text-muted-foreground"}`}>
        {format(d, "MMM d")}
      </div>
      <button
        onClick={() => del.mutate(task.id, { onSuccess: () => toast("Task deleted") })}
        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-priority-high transition"
        aria-label="Delete"
      >
        <Trash2 className="size-3.5" />
      </button>
    </li>
  );
}

export function TaskFormDialog({
  onSubmitted,
  projects,
}: {
  onSubmitted: () => void;
  projects: { id: string; name: string }[];
}) {
  const create = useCreateTask();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [category, setCategory] = useState<Category>("Study");
  const [deadline, setDeadline] = useState(new Date().toISOString().slice(0, 10));
  const [projectId, setProjectId] = useState<string>("none");

  const submit = () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    create.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        category,
        deadline: new Date(deadline).toISOString(),
        status: "Todo",
        projectId: projectId === "none" ? undefined : projectId,
      },
      {
        onSuccess: () => {
          toast.success("Task created");
          onSubmitted();
        },
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  return (
    <DialogContent className="bg-card border-border">
      <DialogHeader>
        <DialogTitle>New task</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <div>
          <Label className="text-xs">Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-surface-1 border-border mt-1" />
        </div>
        <div>
          <Label className="text-xs">Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="bg-surface-1 border-border mt-1 min-h-[70px]" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
              <SelectTrigger className="bg-surface-1 border-border mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger className="bg-surface-1 border-border mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Deadline</Label>
            <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="bg-surface-1 border-border mt-1" />
          </div>
          <div>
            <Label className="text-xs">Project</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="bg-surface-1 border-border mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={submit} disabled={create.isPending}>
          {create.isPending ? "Creating…" : "Create task"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
