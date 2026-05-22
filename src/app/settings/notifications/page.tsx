"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";

interface ToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function Toggle({ label, description, checked, onChange }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b-2 border-foreground last:border-0">
      <div>
        <div className="font-bold text-sm">{label}</div>
        <div className="text-xs text-muted-foreground font-medium mt-0.5">{description}</div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 rounded-full transition-colors border-2 border-foreground ${checked ? "bg-gradient-to-r from-primary to-secondary" : "bg-muted"}`}
      >
        <div className={`h-5 w-5 rounded-full bg-card shadow-hard-sm transition-transform duration-300 border-2 border-foreground ${checked ? "translate-x-6" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

export default function NotificationsSettingsPage() {
  const [settings, setSettings] = useState({
    emailReminders: true,
    paymentConfirmations: true,
    invoiceViewed: false,
    weeklyDigest: false,
    legalUpdates: true,
  });
  const [saving, setSaving] = useState(false);

  function toggleSetting(key: keyof typeof settings) {
    setSettings((s) => ({ ...s, [key]: !s[key] }));
  }

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href="/settings"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="font-display font-extrabold text-2xl">Notifications</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Email Notifications</CardTitle>
          <CardDescription>Control which emails you receive from PayFlow.</CardDescription>
        </CardHeader>
        <CardContent>
          <Toggle label="Payment Reminders" description="When automated reminders are sent to clients" checked={settings.emailReminders} onChange={() => toggleSetting("emailReminders")} />
          <Toggle label="Payment Confirmations" description="When a client completes a payment" checked={settings.paymentConfirmations} onChange={() => toggleSetting("paymentConfirmations")} />
          <Toggle label="Invoice Viewed Alerts" description="When a client opens an invoice for the first time" checked={settings.invoiceViewed} onChange={() => toggleSetting("invoiceViewed")} />
          <Toggle label="Weekly Digest" description="A summary of your invoices and payments each week" checked={settings.weeklyDigest} onChange={() => toggleSetting("weeklyDigest")} />
          <Toggle label="Legal Escalation Updates" description="Status updates on demand letters and legal actions" checked={settings.legalUpdates} onChange={() => toggleSetting("legalUpdates")} />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Link href="/settings"><Button variant="outline">Cancel</Button></Link>
        <Button variant="gradient" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
