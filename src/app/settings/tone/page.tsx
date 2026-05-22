"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, Plus, X, Sparkles } from "lucide-react";

const toneDescriptions: Record<string, { label: string; description: string; gradient: string }> = {
  friendly: { label: "Friendly", description: "Warm and approachable, like a gentle nudge between friends", gradient: "from-primary to-secondary" },
  formal: { label: "Formal", description: "Professional and business-like, maintaining clear boundaries", gradient: "from-secondary to-rose-400" },
  direct: { label: "Direct", description: "Straightforward and urgent, no fluff — payment is required", gradient: "from-tertiary to-orange-400" },
  legal: { label: "Legal", description: "Firm and legally precise, referencing potential escalation", gradient: "from-destructive to-rose-400" },
};

export default function ToneSettingsPage() {
  const [samples, setSamples] = useState<Array<{ content: string; context: string }>>([]);
  const [newContent, setNewContent] = useState("");
  const [newContext, setNewContext] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function addSample() {
    if (!newContent.trim()) return;
    setSamples([...samples, { content: newContent.trim(), context: newContext.trim() || "General" }]);
    setNewContent("");
    setNewContext("");
  }

  function removeSample(i: number) {
    setSamples(samples.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/ai/tone-samples", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ samples }),
      });
      if (!res.ok) throw new Error("Failed to save samples");
    } catch {
      setError("Failed to save tone samples");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href="/settings"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="font-display font-extrabold text-2xl">AI Tone Settings</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Tone Profiles</CardTitle>
          <CardDescription>PayFlow AI adapts reminders to match the tone you select. Here&rsquo;s what each tone means.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(toneDescriptions).map(([key, info]) => (
              <div key={key} className="p-4 rounded-xl border-2 border-foreground bg-muted/20">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`h-6 w-6 rounded-full bg-gradient-to-br ${info.gradient} border-2 border-foreground shadow-hard-sm`} />
                  <span className="font-extrabold text-sm">{info.label}</span>
                </div>
                <p className="text-xs text-muted-foreground font-medium">{info.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Writing Samples</CardTitle>
          <CardDescription>Upload examples of how you write to clients. The AI uses these to match your personal communication style.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-xl border-2 border-destructive bg-destructive/10 p-3 text-sm font-bold text-destructive">{error}</div>
          )}

          <div className="space-y-3 mb-6">
            {samples.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground font-medium text-sm">
                No writing samples yet. Add samples to help the AI match your tone.
              </div>
            ) : (
              samples.map((sample, i) => (
                <div key={i} className="flex items-start justify-between p-3 rounded-xl border-2 border-foreground bg-muted/10">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{sample.context}</div>
                    <p className="text-sm font-medium truncate">{sample.content}</p>
                  </div>
                  <button onClick={() => removeSample(i)} className="text-muted-foreground hover:text-destructive ml-2 shrink-0">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="space-y-3 p-4 rounded-xl border-2 border-foreground bg-muted/20">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Writing Sample</label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Hi Aisha, hope you had a great weekend! Just checking in on invoice #42..."
                rows={3}
                className="flex w-full rounded-xl border-2 border-foreground bg-card px-4 py-2.5 text-sm font-medium placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:border-primary focus-visible:shadow-[4px_4px_0px_0px_#8B5CF6] transition-all duration-200 resize-y"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Context (optional)</label>
              <Input value={newContext} onChange={(e) => setNewContext(e.target.value)} placeholder="e.g. Follow-up email, initial outreach" />
            </div>
            <Button variant="outline" size="sm" onClick={addSample}><Plus className="h-4 w-4 mr-1" /> Add Sample</Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 mt-6">
        <Link href="/settings"><Button variant="outline">Cancel</Button></Link>
        <Button variant="gradient" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          Save Tone Samples
        </Button>
      </div>
    </div>
  );
}
