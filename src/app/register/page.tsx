"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Loader2 } from "lucide-react";

async function fetchCsrfToken(): Promise<{ token: string; headerName: string }> {
  const res = await fetch("/api/auth/csrf");
  const data = await res.json();
  return { token: data.token || "", headerName: data.headerName || "x-csrf-token" };
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [csrf, setCsrf] = useState({ token: "", headerName: "x-csrf-token" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCsrfToken().then(setCsrf).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [csrf.headerName]: csrf.token,
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed");
        setLoading(false);
        return;
      }

      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [csrf.headerName]: csrf.token,
        },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        setError("Account created but login failed. Please log in manually.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      <div className="absolute inset-0 dot-grid pointer-events-none" />
      <div className="absolute top-0 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md px-4 relative z-10">
        <div className="rounded-2xl border-2 border-foreground bg-card p-8 shadow-hard">
          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary border-2 border-foreground shadow-hard-sm mb-4">
              <Zap className="h-7 w-7 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="font-display font-extrabold text-3xl tracking-tight">
              Create Account
            </h1>
            <p className="mt-2 text-sm text-muted-foreground font-medium">
              Start getting paid on time
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border-2 border-destructive bg-destructive/10 p-3 text-sm font-bold text-destructive text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl border-2 border-foreground bg-card px-4 py-2.5 text-sm font-medium placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:shadow-[4px_4px_0px_0px_#8B5CF6] transition-all duration-200"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border-2 border-foreground bg-card px-4 py-2.5 text-sm font-medium placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:shadow-[4px_4px_0px_0px_#8B5CF6] transition-all duration-200"
                placeholder="name@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-xl border-2 border-foreground bg-card px-4 py-2.5 text-sm font-medium placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:shadow-[4px_4px_0px_0px_#8B5CF6] transition-all duration-200"
                placeholder="Min 8 characters"
              />
            </div>
            <Button
              type="submit"
              variant="gradient"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm font-medium text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary font-bold hover:underline underline-offset-4"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
