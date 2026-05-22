"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, Loader2, Lock, CheckCircle } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Password reset failed");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="rounded-2xl border-2 border-foreground bg-card p-8 shadow-hard">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-destructive to-red-500 border-2 border-foreground shadow-hard-sm mb-4">
            <Lock className="h-7 w-7 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="font-display font-extrabold text-3xl tracking-tight">
            Invalid Reset Link
          </h1>
          <p className="mt-2 text-sm text-muted-foreground font-medium">
            This password reset link is malformed.
          </p>
        </div>
        <Link href="/forgot-password">
          <Button variant="gradient" className="w-full" size="lg">
            Request New Link
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md px-4 relative z-10">
      <div className="rounded-2xl border-2 border-foreground bg-card p-8 shadow-hard">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary border-2 border-foreground shadow-hard-sm mb-4">
            {success ? (
              <CheckCircle className="h-7 w-7 text-white" strokeWidth={2.5} />
            ) : (
              <Zap className="h-7 w-7 text-white" strokeWidth={2.5} />
            )}
          </div>
          <h1 className="font-display font-extrabold text-3xl tracking-tight">
            {success ? "Password Reset!" : "Set New Password"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground font-medium">
            {success
              ? "Your password has been updated"
              : "Choose a new password for your account"}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border-2 border-destructive bg-destructive/10 p-3 text-sm font-bold text-destructive text-center">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center space-y-4">
            <Link href="/login">
              <Button variant="gradient" className="w-full" size="lg">
                Log In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                New Password
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
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                <Lock className="mr-2 h-4 w-4" />
              )}
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm font-medium text-muted-foreground">
          <Link
            href="/login"
            className="text-primary font-bold hover:underline underline-offset-4"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      <div className="absolute inset-0 dot-grid pointer-events-none" />
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
