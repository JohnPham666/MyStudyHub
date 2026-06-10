import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  BookOpen,
  CalendarClock,
  BarChart3,
  GraduationCap,
  LogOut,
} from "lucide-react";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/lib/auth-context";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/resources", label: "Resources", icon: BookOpen },
  { to: "/schedule", label: "Teaching", icon: CalendarClock },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
] as const;

export function AppShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const { user, logout, isDemo } = useAuth();

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
          <div className="flex items-center gap-2 px-5 py-5 border-b border-sidebar-border">
            <div className="grid place-items-center size-8 rounded-md bg-primary text-primary-foreground">
              <GraduationCap className="size-4" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Study Hub</div>
              <div className="text-[11px] text-muted-foreground">Productivity OS</div>
            </div>
          </div>
          <nav className="flex-1 px-2 py-3 space-y-0.5">
            {nav.map(({ to, label, icon: Icon }) => {
              const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <Icon className="size-4" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="px-4 py-4 border-t border-sidebar-border">
            <div className="rounded-md bg-surface-2 p-3">
              <div className="flex items-center gap-2">
                <div className="text-xs font-medium truncate">{user?.fullName || user?.username || "Student"}</div>
                {isDemo && (
                  <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-yellow-500/15 text-yellow-500 border border-yellow-500/20">
                    DEMO
                  </span>
                )}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{user?.email || "Focus on what ships first."}</div>
              <button
                onClick={logout}
                className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="size-3" /> Sign out
              </button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          {/* Mobile top nav */}
          <div className="md:hidden flex items-center gap-2 overflow-x-auto border-b border-border px-3 py-2 bg-sidebar">
            {nav.map(({ to, label, icon: Icon }) => {
              const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs whitespace-nowrap ${
                    active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="size-3.5" />
                  {label}
                </Link>
              );
            })}
          </div>

          <header className="border-b border-border px-6 md:px-8 py-5 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight">{title}</h1>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </header>

          <div className="px-6 md:px-8 py-6">{children}</div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
