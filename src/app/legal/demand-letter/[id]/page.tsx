"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useInvoice } from "@/hooks/use-invoices";
import { formatCurrency } from "@/lib/utils/format";
import { ArrowLeft, Loader2, Download, RefreshCw, AlertCircle } from "lucide-react";

export default function InvoiceDemandLetterPage() {
  const params = useParams();
  const id = params.id as string;
  const { invoice, loading, error } = useInvoice(id);
  const [generating, setGenerating] = useState(false);
  const [letter, setLetter] = useState<{ subject: string; body: string } | null>(null);
  const [genError, setGenError] = useState("");

  useEffect(() => {
    if (invoice) generateLetter();
  }, [invoice]);

  async function generateLetter() {
    if (!invoice) return;
    setGenerating(true);
    setGenError("");
    try {
      const res = await fetch("/api/ai/generate-demand-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: invoice.client?.name || "",
          clientCompany: invoice.client?.company || "",
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.total,
          daysOverdue: Math.max(0, Math.round((Date.now() - new Date(invoice.dueDate).getTime()) / 86400000)),
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

  if (error || !invoice) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 border-2 border-destructive mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" strokeWidth={2.5} />
        </div>
        <h2 className="font-display font-extrabold text-xl">{error || "Invoice not found"}</h2>
        <Link href="/legal" className="mt-4"><Button variant="outline">Back to Legal</Button></Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href="/legal"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="font-display font-extrabold text-2xl">Demand Letter</h1>
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle className="text-lg">Invoice Summary</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-muted-foreground">Invoice</span>
            <span className="font-bold">{invoice.invoiceNumber}</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span className="text-muted-foreground">Client</span>
            <span className="font-bold">{invoice.client?.name}</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-bold">{formatCurrency(Number(invoice.total))}</span>
          </div>
        </CardContent>
      </Card>

      {genError && (
        <div className="mb-4 rounded-xl border-2 border-destructive bg-destructive/10 p-3 text-sm font-bold text-destructive">{genError}</div>
      )}

      {generating ? (
        <LoadingSpinner />
      ) : letter ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{letter.subject}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={generateLetter}>
                <RefreshCw className="h-4 w-4 mr-2" /> Regenerate
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
      ) : null}
    </div>
  );
}
