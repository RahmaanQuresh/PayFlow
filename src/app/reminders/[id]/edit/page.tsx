"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useSequence } from "@/hooks/use-reminders";
import { ArrowLeft, Plus, X, Loader2, Trash2, AlertCircle } from "lucide-react";
import { REMINDER_TONES } from "@/lib/utils/constants";
import type { ReminderTone } from "@/types";

const defaultStep = { daysAfterDue: 7, tone: "friendly" as ReminderTone, subject: "", body: "", useAi: false };

export default function ReminderEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { sequence, loading: fetchLoading, error: fetchError } = useSequence(id);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState([{ ...defaultStep }]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (sequence) {
      setName(sequence.name || "");
      setDescription(sequence.description || "");
      if (sequence.steps && sequence.steps.length > 0) {
        setSteps(
          sequence.steps.map((s) => ({
            daysAfterDue: s.daysAfterDue,
            tone: s.tone as ReminderTone,
            subject: s.subject,
            body: s.body,
            useAi: s.useAi,
          }))
        );
      }
    }
  }, [sequence]);

  function addStep() { setSteps([...steps, { ...defaultStep }]); }
  function removeStep(i: number) { setSteps(steps.filter((_, idx) => idx !== i)); }
  function updateStep(i: number, field: string, value: string | number | boolean) {
    const updated = [...steps];
    (updated[i] as Record<string, string | number | boolean>)[field] = value;
    setSteps(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Name is required"); return; }
    const invalidStep = steps.find((s) => !s.subject.trim() || !s.body.trim());
    if (invalidStep) { setError("All steps must have a subject and body"); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/reminders/sequences/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined, steps }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Failed to update sequence"); setSaving(false); return; }
      router.push("/reminders");
    } catch {
      setError("Something went wrong");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this sequence?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/reminders/sequences/${id}`, { method: "DELETE" });
      router.push("/reminders");
    } catch {
      setError("Failed to delete sequence");
      setDeleting(false);
    }
  }

  if (fetchLoading) return <LoadingSpinner />;

  if (fetchError || !sequence) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 border-2 border-destructive mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" strokeWidth={2.5} />
        </div>
        <h2 className="font-display font-extrabold text-xl">{fetchError || "Sequence not found"}</h2>
        <Link href="/reminders" className="mt-4"><Button variant="outline">Back to Reminders</Button></Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href="/reminders"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="font-display font-extrabold text-2xl">Edit Sequence</h1>
        {sequence.isDefault && (
          <span className="rounded-full bg-gradient-to-r from-tertiary to-orange-400 text-foreground border-2 border-foreground px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-hard-sm">Default</span>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-xl border-2 border-destructive bg-destructive/10 p-3 text-sm font-bold text-destructive">{error}</div>
      )}

      <Card className="mb-6">
        <CardHeader><CardTitle className="text-lg">Sequence Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Name *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="3-Step Friendly Follow-up" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Description</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Gentle reminders for long-term clients" />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-extrabold text-lg">Steps</h2>
        <Button variant="outline" size="sm" onClick={addStep}><Plus className="h-4 w-4 mr-1" />Add Step</Button>
      </div>

      <div className="space-y-4">
        {steps.map((step, i) => (
          <Card key={i} className="relative">
            {steps.length > 1 && (
              <button onClick={() => removeStep(i)} className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors">
                <X className="h-4 w-4" />
              </button>
            )}
            <CardContent className="py-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-white font-black text-xs border-2 border-foreground shadow-hard-sm">
                  {i + 1}
                </div>
                <span className="font-extrabold">Step {i + 1}</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Days After Due</label>
                  <Input type="number" min={1} value={step.daysAfterDue} onChange={(e) => updateStep(i, "daysAfterDue", Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Tone</label>
                  <select
                    value={step.tone}
                    onChange={(e) => updateStep(i, "tone", e.target.value)}
                    className="w-full rounded-xl border-2 border-foreground bg-card px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-primary focus:shadow-[4px_4px_0px_0px_#8B5CF6] transition-all duration-200"
                  >
                    {REMINDER_TONES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Subject</label>
                <Input value={step.subject} onChange={(e) => updateStep(i, "subject", e.target.value)} placeholder="Friendly Reminder: Invoice #{invoice_number}" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Body</label>
                <textarea
                  value={step.body}
                  onChange={(e) => updateStep(i, "body", e.target.value)}
                  placeholder="Hi {client_name},\n\nJust a friendly reminder..."
                  rows={4}
                  className="flex w-full rounded-xl border-2 border-foreground bg-card px-4 py-2.5 text-sm font-medium placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:border-primary focus-visible:shadow-[4px_4px_0px_0px_#8B5CF6] transition-all duration-200 resize-y"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={`ai-${i}`}
                  checked={step.useAi}
                  onChange={(e) => updateStep(i, "useAi", e.target.checked)}
                  className="h-4 w-4 rounded border-2 border-foreground accent-primary"
                />
                <label htmlFor={`ai-${i}`} className="text-sm font-medium">Use AI to adapt tone based on client relationship</label>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between mt-6">
        <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
          {deleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
          Delete Sequence
        </Button>
        <div className="flex gap-3">
          <Link href="/reminders"><Button variant="outline">Cancel</Button></Link>
          <Button variant="gradient" onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
