"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, Check, Shield } from "lucide-react";

export default function SecuritySettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to change password");
      }
      setSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href="/settings"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="font-display font-extrabold text-2xl">Security</h1>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border-2 border-destructive bg-destructive/10 p-3 text-sm font-bold text-destructive">{error}</div>
      )}
      {saved && (
        <div className="mb-4 rounded-xl border-2 border-quaternary bg-quaternary/10 p-3 text-sm font-bold text-quaternary flex items-center gap-2">
          <Check className="h-4 w-4" strokeWidth={3} /> Password changed successfully
        </div>
      )}

      <form onSubmit={handlePasswordChange}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Change Password</CardTitle>
            <CardDescription>Use a strong password you don&rsquo;t use elsewhere.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Current Password</label>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">New Password</label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 8 characters" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Confirm New Password</label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 mt-6">
          <Link href="/settings"><Button variant="outline">Cancel</Button></Link>
          <Button variant="gradient" type="submit" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Change Password
          </Button>
        </div>
      </form>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">Active Sessions</CardTitle>
          <CardDescription>Manage your active login sessions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-3 border-b-2 border-foreground">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary border-2 border-foreground shadow-hard-sm">
                <Shield className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <div className="font-bold text-sm">Current Session</div>
                <div className="text-xs text-muted-foreground font-medium">Windows • Chrome • Now</div>
              </div>
            </div>
            <span className="rounded-full bg-gradient-to-r from-quaternary to-emerald-400 text-white border-2 border-foreground px-3 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-hard-sm">Active</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
