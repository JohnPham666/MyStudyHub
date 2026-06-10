import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { categoryColor, priorityColor, type Task } from "@/lib/mock-data";
import { useTasks, useProjects, useSchedule } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Flame, FolderKanban, ArrowRight } from "lucide-react";
import { format, isToday, isPast, differenceInCalendarDays } from "date-fns";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Study Hub" },
      { name: "description", content: "Today's plan, deadlines, project progress and teaching schedule." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const tasks = useTasks().data ?? [];
  const projects = useProjects().data ?? [];
  const schedule = useSchedule().data ?? [];

  const todayTasks = tasks.filter((t) => isToday(new Date(t.deadline)) && t.status !== "Done");
  const upcoming = [...tasks]
    .filter((t) => t.status !== "Done")
    .sort((a, b) => +new Date(a.deadline) - +new Date(b.deadline))
    .slice(0, 6);
  const doneCount = tasks.filter((t) => t.status === "Done").length;
  const overdue = tasks.filter(
    (t) => t.status !== "Done" && isPast(new Date(t.deadline)) && !isToday(new Date(t.deadline)),
  ).length;

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayClasses = schedule.filter((c) => c.date === todayKey);

  return (
    <AppShell title="Good to see you back" description={format(new Date(), "EEEE, MMMM d")}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat icon={<Clock className="size-4" />} label="Due today" value={todayTasks.length} />
        <Stat icon={<Flame className="size-4 text-priority-high" />} label="Overdue" value={overdue} accent />
        <Stat icon={<CheckCircle2 className="size-4" />} label="Completed" value={doneCount} />
        <Stat icon={<FolderKanban className="size-4" />} label="Active projects" value={projects.length} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-6">
        <Card className="lg:col-span-2 bg-card border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium">Today</h2>
            <Link to="/tasks" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              All tasks <ArrowRight className="size-3" />
            </Link>
          </div>
          {todayTasks.length === 0 ? (
            <Empty text="Nothing due today. Get ahead on something." />
          ) : (
            <ul className="space-y-1.5">
              {todayTasks.map((t) => (
                <TaskRow key={t.id} task={t} />
              ))}
            </ul>
          )}

          <div className="border-t border-border mt-6 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Upcoming</h3>
            </div>
            <ul className="space-y-1.5">
              {upcoming.map((t) => (
                <TaskRow key={t.id} task={t} showDate />
              ))}
            </ul>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="bg-card border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium">Projects</h2>
              <Link to="/projects" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                View <ArrowRight className="size-3" />
              </Link>
            </div>
            <div className="space-y-4">
              {projects.slice(0, 3).map((p) => (
                <div key={p.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="text-sm truncate pr-2">{p.name}</div>
                    <div className="text-xs text-muted-foreground tabular-nums">{p.progress}%</div>
                  </div>
                  <Progress value={p.progress} className="h-1.5" />
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-card border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium">Teaching today</h2>
              <Link to="/schedule" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                Schedule <ArrowRight className="size-3" />
              </Link>
            </div>
            {todayClasses.length === 0 ? (
              <Empty text="No classes today." />
            ) : (
              <ul className="space-y-2">
                {todayClasses.map((c) => (
                  <li key={c.id} className="flex items-start justify-between gap-3 rounded-md bg-surface-2 px-3 py-2.5">
                    <div className="min-w-0">
                      <div className="text-sm truncate">{c.subject}</div>
                      <div className="text-xs text-muted-foreground truncate">{c.studentName}</div>
                    </div>
                    <div className="text-xs font-mono text-muted-foreground shrink-0">
                      {c.time} · {c.duration}m
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number; accent?: boolean }) {
  return (
    <Card className="bg-card border-border p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className={`text-2xl font-semibold mt-2 tabular-nums ${accent && value > 0 ? "text-priority-high" : ""}`}>
        {value}
      </div>
    </Card>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="text-xs text-muted-foreground py-6 text-center border border-dashed border-border rounded-md">{text}</div>;
}

export function TaskRow({ task, showDate }: { task: Task; showDate?: boolean }) {
  const d = new Date(task.deadline);
  const days = differenceInCalendarDays(d, new Date());
  const dateLabel = days === 0 ? "Today" : days === 1 ? "Tomorrow" : days < 0 ? `${Math.abs(days)}d overdue` : `${days}d`;
  return (
    <li className="group flex items-center gap-3 rounded-md px-2.5 py-2 hover:bg-surface-2 transition-colors">
      <span className="size-1.5 rounded-full shrink-0" style={{ background: priorityColor(task.priority) }} aria-label={task.priority} />
      <div className="min-w-0 flex-1">
        <div className="text-sm truncate">{task.title}</div>
      </div>
      <Badge variant="outline" className="text-[10px] font-normal border-border/70" style={{ color: categoryColor(task.category) }}>
        {task.category}
      </Badge>
      {showDate && (
        <span className={`text-xs tabular-nums shrink-0 ${days < 0 ? "text-priority-high" : "text-muted-foreground"}`}>
          {dateLabel}
        </span>
      )}
    </li>
  );
}
