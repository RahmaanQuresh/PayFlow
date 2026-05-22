"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useInvoices } from "@/hooks/use-invoices";
import { formatCurrency } from "@/lib/utils/format";
import { ArrowLeft, Loader2, Download, RefreshCw, ArrowRight, AlertCircle } from "lucide-react";

export default function DemandLetterPage() {
  const { invoices, loading, error, refetch } = useInvoices();
  const [invoiceId, setInvoiceId] = useState("");
  const [generating, setGenerating] = useState(false);
  const [letter, setLetter] = useState<{ subject: string; body: string } | null>(null);
  const [genError, setGenError] = useState("");

  const selectedInvoice = invoices.find((inv) => inv.id === invoiceId);

  async function generateLetter() {
    if (!selectedInvoice) return;
    setGenerating(true);
    setGenError("");
    try {
      const res = await fetch("/api/ai/generate-demand-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: selectedInvoice.client?.name || "",
          clientCompany: selectedInvoice.client?.company || "",
          invoiceNumber: selectedInvoice.invoiceNumber,
          amount: selectedInvoice.total,
          daysOverdue: Math.max(0, Math.round((Date.now() - new Date(selectedInvoice.dueDate).getTime()) / 86400000)),
          freelancerName: "Freelancer",
          freelancerBusinessName: "",
          freelancerAddress: "",
          jurisdiction: "US",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to generate letter");
      setLetter({ subject: data.subject, body: data.body });
    } catch (e) {
      setGenError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 border-2 border-destructive mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" strokeWidth={2.5} />
        </div>
        <h2 className="font-display font-extrabold text-xl">Failed to load data</h2>
        <p className="text-muted-foreground font-medium mt-1">{error}</p>
        <Button variant="outline" className="mt-4" onClick={refetch}>Try Again</Button>
      </div>
    );
  }

  const overdueInvoices = invoices.filter((i) => i.status === "overdue");

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href="/legal"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="font-display font-extrabold text-2xl">Demand Letter Generator</h1>
      </div>

      {genError && (
        <div className="mb-4 rounded-xl border-2 border-destructive bg-destructive/10 p-3 text-sm font-bold text-destructive">{genError}</div>
      )}

      {!letter ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Generate a Demand Letter</CardTitle>
            <CardDescription>Select an overdue invoice and we'll draft a legally-formatted demand letter.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Select Invoice</label>
              <select
                value={invoiceId}
                onChange={(e) => setInvoiceId(e.target.value)}
                className="w-full rounded-xl border-2 border-foreground bg-card px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-primary focus:shadow-[4px_4px_0px_0px_#8B5CF6] transition-all duration-200"
              >
                <option value="">Select an invoice...</option>
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} — {inv.client?.name} ({formatCurrency(Number(inv.total))}) [{inv.status}]
                  </option>
                ))}
              </select>
            </div>
            {selectedInvoice && (
              <div className="p-4 rounded-xl border-2 border-foreground bg-muted/30 space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-muted-foreground">Client</span>
                  <span className="font-bold">{selectedInvoice.client?.name}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold">{formatCurrency(Number(selectedInvoice.total))}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-muted-foreground">Due Date</span>
                  <span className="font-bold">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</span>
                </div>
              </div>
            )}
            {overdueInvoices.length === 0 && (
              <div className="p-4 rounded-xl border-2 border-tertiary bg-tertiary/10 text-sm font-medium">
                No overdue invoices found. Demand letters are typically sent for invoices past due.
              </div>
            )}
            <Button variant="gradient" onClick={generateLetter} disabled={!invoiceId || generating} className="w-full">
              {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ArrowRight className="h-4 w-4 mr-2" />}
              {generating ? "Generating..." : "Generate Demand Letter"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">{letter.subject}</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setLetter(null); setInvoiceId(""); }}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Redo
                </Button>
                <Button variant="gradient" size="sm" onClick={() => {
                  const blob = new Blob([`Subject: ${letter.subject}\n\n${letter.body}`], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a"); a.href = url; a.download = "demand-letter.txt"; a.click();
                }}>
                  <Download className="h-4 w-4 mr-2" /> Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-6 rounded-xl border-2 border-foreground bg-muted/10 font-mono text-sm whitespace-pre-wrap leading-relaxed">
                {letter.body}
              </div>
              <div className="mt-4 p-3 rounded-xl border-2 border-tertiary bg-tertiary/10 text-xs font-medium text-muted-foreground">
                <strong className="text-foreground">Disclaimer:</strong> This is an AI-generated draft. Review carefully before sending. This does not constitute legal advice.
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
