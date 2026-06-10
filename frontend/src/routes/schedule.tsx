import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useSchedule, useCreateClass, useDeleteClass } from "@/lib/data";
import type { ClassSession } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
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
import { Plus, Trash2, Clock } from "lucide-react";
import { useState, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/schedule")({
  head: () => ({ meta: [{ title: "Teaching — Study Hub" }] }),
  component: SchedulePage,
});

function SchedulePage() {
  const schedule = useSchedule().data ?? [];
  const del = useDeleteClass();
  const [open, setOpen] = useState(false);

  const grouped = useMemo(() => {
    const map = new Map<string, ClassSession[]>();
    [...schedule]
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
      .forEach((c) => {
        const arr = map.get(c.date) || [];
        arr.push(c);
        map.set(c.date, arr);
      });
    return [...map.entries()];
  }, [schedule]);

  return (
    <AppShell
      title="Teaching Schedule"
      description="Your English classes — online & 1-1 tutoring."
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="size-4" />
              New class
            </Button>
          </DialogTrigger>
          <ClassForm onSubmitted={() => setOpen(false)} />
        </Dialog>
      }
    >
      <div className="space-y-5">
        {grouped.map(([date, items]) => (
          <div key={date}>
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 px-1">
              {format(parseISO(date), "EEEE · MMM d")}
            </div>
            <Card className="bg-card border-border divide-y divide-border">
              {items.map((c) => (
                <div key={c.id} className="flex items-center gap-4 p-4 group">
                  <div className="font-mono text-sm text-muted-foreground w-16">{c.time}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">{c.subject}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {c.studentName}
                      {c.note && ` · ${c.note}`}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground inline-flex items-center gap-1">
                    <Clock className="size-3" />
                    {c.duration}m
                  </div>
                  <button
                    onClick={() => del.mutate(c.id, { onSuccess: () => toast("Class removed") })}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-priority-high"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </Card>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

function ClassForm({ onSubmitted }: { onSubmitted: () => void }) {
  const create = useCreateClass();
  const [studentName, setStudentName] = useState("");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("19:00");
  const [duration, setDuration] = useState(60);
  const [note, setNote] = useState("");

  const submit = () => {
    if (!studentName.trim() || !subject.trim()) {
      toast.error("Student and subject required");
      return;
    }
    create.mutate(
      { studentName, subject, date, time, duration, note: note || undefined },
      {
        onSuccess: () => {
          toast.success("Class added");
          onSubmitted();
        },
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  return (
    <DialogContent className="bg-card border-border">
      <DialogHeader>
        <DialogTitle>New class</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Student</Label>
            <Input value={studentName} onChange={(e) => setStudentName(e.target.value)} className="bg-surface-1 border-border mt-1" />
          </div>
          <div>
            <Label className="text-xs">Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="bg-surface-1 border-border mt-1" />
          </div>
          <div>
            <Label className="text-xs">Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-surface-1 border-border mt-1" />
          </div>
          <div>
            <Label className="text-xs">Time</Label>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="bg-surface-1 border-border mt-1" />
          </div>
          <div>
            <Label className="text-xs">Duration (min)</Label>
            <Input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="bg-surface-1 border-border mt-1" />
          </div>
        </div>
        <div>
          <Label className="text-xs">Note</Label>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} className="bg-surface-1 border-border mt-1" />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={submit} disabled={create.isPending}>
          {create.isPending ? "Adding…" : "Add class"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
