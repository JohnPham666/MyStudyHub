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

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Sign up — Study Hub" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register, status } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated") navigate({ to: "/" });
  }, [status, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) return;
    setSubmitting(true);
    try {
      await register({ username, email, password, fullName: fullName || undefined });
      toast.success("Account created");
      navigate({ to: "/" });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Registration failed — check API URL & CORS.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dark min-h-screen bg-background text-foreground grid place-items-center px-4 py-8">
      <Card className="w-full max-w-sm bg-card border-border p-7">
        <div className="flex items-center gap-2 mb-6">
          <div className="grid place-items-center size-9 rounded-md bg-primary text-primary-foreground">
            <GraduationCap className="size-4" />
          </div>
          <div>
            <div className="text-sm font-semibold">Create account</div>
            <div className="text-[11px] text-muted-foreground">Start tracking your work</div>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label className="text-xs">Username</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} className="bg-surface-1 border-border mt-1" />
          </div>
          <div>
            <Label className="text-xs">Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-surface-1 border-border mt-1" />
          </div>
          <div>
            <Label className="text-xs">Full name (optional)</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-surface-1 border-border mt-1" />
          </div>
          <div>
            <Label className="text-xs">Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-surface-1 border-border mt-1" autoComplete="new-password" />
          </div>
          <Button type="submit" className="w-full mt-2" disabled={submitting}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Create account
          </Button>
        </form>
        <div className="text-xs text-muted-foreground mt-5 text-center">
          Already have one?{" "}
          <Link to="/login" className="text-foreground hover:underline">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}
