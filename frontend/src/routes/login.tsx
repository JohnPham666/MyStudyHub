import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api/client";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Study Hub" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login, status, enterDemo } = useAuth();
  const navigate = useNavigate();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated") navigate({ to: "/" });
  }, [status, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) return;
    setSubmitting(true);
    try {
      await login(usernameOrEmail, password);
      toast.success("Welcome back");
      navigate({ to: "/" });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Login failed — check API URL & CORS.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dark min-h-screen bg-background text-foreground grid place-items-center px-4">
      <Card className="w-full max-w-sm bg-card border-border p-7">
        <div className="flex items-center gap-2 mb-6">
          <div className="grid place-items-center size-9 rounded-md bg-primary text-primary-foreground">
            <GraduationCap className="size-4" />
          </div>
          <div>
            <div className="text-sm font-semibold">Study Hub</div>
            <div className="text-[11px] text-muted-foreground">Sign in to continue</div>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label className="text-xs">Username or email</Label>
            <Input
              autoFocus
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              className="bg-surface-1 border-border mt-1"
              autoComplete="username"
            />
          </div>
          <div>
            <Label className="text-xs">Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-surface-1 border-border mt-1"
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" className="w-full mt-2" disabled={submitting}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Sign in
          </Button>
        </form>
        <Button
          type="button"
          variant="outline"
          className="w-full mt-3"
          onClick={() => {
            enterDemo();
            navigate({ to: "/" });
          }}
        >
          Try demo (no login)
        </Button>
        <div className="text-xs text-muted-foreground mt-5 text-center">
          No account?{" "}
          <Link to="/register" className="text-foreground hover:underline">
            Create one
          </Link>
        </div>
      </Card>
    </div>
  );
}
