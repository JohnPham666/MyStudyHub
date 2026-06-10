import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { fetchMe, loginRequest, logoutLocal, registerRequest, type AuthUser } from "./api/auth";
import { tokenStore, demoStore } from "./api/client";

const DEMO_USER: AuthUser = {
  id: "demo",
  username: "student",
  email: "demo@studyhub.dev",
  fullName: "Demo Student",
};

interface AuthContextValue {
  user: AuthUser | null;
  status: "loading" | "authenticated" | "unauthenticated";
  isDemo: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (input: { username: string; email: string; password: string; fullName?: string }) => Promise<void>;
  enterDemo: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      if (demoStore.active()) {
        if (!cancelled) {
          setUser(DEMO_USER);
          setIsDemo(true);
          setStatus("authenticated");
        }
        return;
      }
      if (!tokenStore.getAccess()) {
        setStatus("unauthenticated");
        return;
      }
      try {
        const me = await fetchMe();
        if (!cancelled) {
          setUser(me);
          setStatus("authenticated");
        }
      } catch {
        if (!cancelled) {
          tokenStore.clear();
          setStatus("unauthenticated");
        }
      }
    };
    init();

    const onLogout = () => {
      setUser(null);
      setIsDemo(false);
      setStatus("unauthenticated");
    };
    window.addEventListener("auth:logout", onLogout);
    return () => {
      cancelled = true;
      window.removeEventListener("auth:logout", onLogout);
    };
  }, []);

  const login = async (usernameOrEmail: string, password: string) => {
    const u = await loginRequest({ usernameOrEmail, password });
    setUser(u);
    setIsDemo(false);
    setStatus("authenticated");
  };

  const register: AuthContextValue["register"] = async (input) => {
    const u = await registerRequest(input);
    setUser(u);
    setIsDemo(false);
    setStatus("authenticated");
  };

  const enterDemo = () => {
    demoStore.enable();
    setUser(DEMO_USER);
    setIsDemo(true);
    setStatus("authenticated");
  };

  const logout = () => {
    logoutLocal();
    demoStore.disable();
    setUser(null);
    setIsDemo(false);
    setStatus("unauthenticated");
  };

  return (
    <AuthContext.Provider value={{ user, status, isDemo, login, register, enterDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
