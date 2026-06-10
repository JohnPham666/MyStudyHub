import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { CATEGORIES, categoryColor } from "@/lib/mock-data";
import { useTasks } from "@/lib/data";
import { Card } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, startOfWeek, addDays, isSameDay, startOfMonth, endOfMonth, eachWeekOfInterval, isWithinInterval, isPast } from "date-fns";
import { useMemo } from "react";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Study Hub" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const tasks = useTasks().data ?? [];

  // Weekly completed (last 7 days)
  const weekData = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(start, i);
      const completed = tasks.filter(
        (t) => t.status === "Done" && isSameDay(new Date(t.deadline), d),
      ).length;
      return { day: format(d, "EEE"), completed };
    });
  }, [tasks]);

  // Monthly completed by week
  const monthData = useMemo(() => {
    const now = new Date();
    const weeks = eachWeekOfInterval(
      { start: startOfMonth(now), end: endOfMonth(now) },
      { weekStartsOn: 1 },
    );
    return weeks.map((w, i) => {
      const end = addDays(w, 6);
      const completed = tasks.filter(
        (t) => t.status === "Done" && isWithinInterval(new Date(t.deadline), { start: w, end }),
      ).length;
      return { week: `W${i + 1}`, completed };
    });
  }, [tasks]);

  // Deadline hit-rate
  const total = tasks.filter((t) => t.status === "Done" || isPast(new Date(t.deadline))).length;
  const onTime = tasks.filter((t) => t.status === "Done").length;
  const hitRate = total === 0 ? 0 : Math.round((onTime / total) * 100);

  // Time per category (proxy: task count)
  const catData = CATEGORIES.map((c) => ({
    name: c,
    value: tasks.filter((t) => t.category === c).length,
    fill: categoryColor(c),
  })).filter((d) => d.value > 0);

  return (
    <AppShell title="Productivity Analytics" description="See where your time is actually going.">
      <div className="grid lg:grid-cols-3 gap-4">
        <StatBig label="Completed this week" value={weekData.reduce((a, b) => a + b.completed, 0)} />
        <StatBig label="Deadline hit rate" value={`${hitRate}%`} />
        <StatBig label="Tasks tracked" value={tasks.length} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <Card className="bg-card border-border p-5">
          <h3 className="text-sm font-medium mb-4">Completed this week</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="completed" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-card border-border p-5">
          <h3 className="text-sm font-medium mb-4">Monthly trend</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
                <Line type="monotone" dataKey="completed" stroke="var(--chart-2)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-card border-border p-5 lg:col-span-2">
          <h3 className="text-sm font-medium mb-4">Where your effort goes (by category)</h3>
          <div className="grid md:grid-cols-2 gap-4 items-center">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={catData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                    {catData.map((d, i) => (
                      <Cell key={i} fill={d.fill} stroke="var(--background)" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-2">
              {catData.map((c) => (
                <li key={c.name} className="flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-2">
                    <span className="size-2.5 rounded-sm" style={{ background: c.fill }} />
                    {c.name}
                  </span>
                  <span className="text-muted-foreground tabular-nums">{c.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function StatBig({ label, value }: { label: string; value: number | string }) {
  return (
    <Card className="bg-card border-border p-5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-3xl font-semibold mt-2 tabular-nums">{value}</div>
    </Card>
  );
}
