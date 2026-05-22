"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, X, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useClients } from "@/hooks/use-clients";
import { toast } from "sonner";

const defaultLineItem = { description: "", quantity: 1, rate: 0 };

export default function InvoiceCreatePage() {
  const router = useRouter();
  const { clients } = useClients();
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("NET30");
  const [lineItems, setLineItems] = useState([{ ...defaultLineItem }]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function addLine() {
    setLineItems([...lineItems, { ...defaultLineItem }]);
  }

  function removeLine(i: number) {
    setLineItems(lineItems.filter((_, idx) => idx !== i));
  }

  function updateLine(i: number, field: string, value: string | number) {
    const updated = [...lineItems];
    (updated[i] as Record<string, string | number>)[field] = value;
    setLineItems(updated);
  }

  const subtotal = lineItems.reduce((s, li) => s + li.quantity * li.rate, 0);

  async function handleSubmit(e: React.FormEvent, action: "draft" | "send") {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || "Untitled Invoice",
          clientId,
          issueDate: new Date(issueDate),
          dueDate: new Date(dueDate || Date.now() + 30 * 86400000),
          paymentTerms,
          lineItems: lineItems.map((li) => ({
            description: li.description || "Service",
            quantity: li.quantity,
            rate: li.rate,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to create invoice");
        setLoading(false);
        return;
      }

      if (action === "send" && data.invoice) {
        await fetch(`/api/invoices/${data.invoice.id}/send`, { method: "POST" });
        toast.success("Invoice sent successfully");
      } else {
        toast.success("Invoice saved as draft");
      }

      router.push("/invoices");
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href="/invoices">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="font-display font-extrabold text-2xl">New Invoice</h1>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border-2 border-destructive bg-destructive/10 p-3 text-sm font-bold text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Client</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Select Client</label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full rounded-xl border-2 border-foreground bg-card px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-primary focus:shadow-[4px_4px_0px_0px_#8B5CF6] transition-all duration-200"
                >
                  <option value="">Select client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <Link href="/clients/new">
                <Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-1" /> Add New Client</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Invoice Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Website Redesign" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Issue Date</label>
                <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Due Date</label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Payment Terms</label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full rounded-xl border-2 border-foreground bg-card px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-primary focus:shadow-[4px_4px_0px_0px_#8B5CF6] transition-all duration-200"
              >
                <option value="NET7">Net 7</option>
                <option value="NET14">Net 14</option>
                <option value="NET30">Net 30</option>
                <option value="CUSTOM">Custom</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Line Items</CardTitle>
          <Button variant="outline" size="sm" onClick={addLine}><Plus className="h-4 w-4 mr-1" /> Add Line Item</Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-4 items-center text-xs font-bold uppercase tracking-wider text-muted-foreground pb-3 border-b-2 border-foreground min-w-[640px]">
                <div className="col-span-5">Description</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-2">Rate</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-1"></div>
              </div>
              {lineItems.map((li, i) => (
                <div key={i} className="grid grid-cols-12 gap-4 items-center min-w-[640px]">
                  <div className="col-span-5">
                    <Input value={li.description} onChange={(e) => updateLine(i, "description", e.target.value)} placeholder="Service description" />
                  </div>
                  <div className="col-span-2">
                    <Input type="number" value={li.quantity} onChange={(e) => updateLine(i, "quantity", Number(e.target.value))} min={1} />
                  </div>
                  <div className="col-span-2">
                    <Input type="number" value={li.rate} onChange={(e) => updateLine(i, "rate", Number(e.target.value))} placeholder="0.00" min={0} step="0.01" />
                  </div>
                  <div className="col-span-2 text-right font-bold">{formatCurrency(li.quantity * li.rate)}</div>
                  <div className="col-span-1">
                    {lineItems.length > 1 && (
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => removeLine(i)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end mt-6 pt-4 border-t-2 border-foreground">
            <div className="w-56 space-y-2">
              <div className="flex justify-between text-sm font-medium"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between text-sm font-medium"><span>Tax (0%)</span><span>$0.00</span></div>
              <div className="flex justify-between font-extrabold text-lg pt-2 border-t-2 border-foreground"><span>Total</span><span>{formatCurrency(subtotal)}</span></div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 mt-6">
        <Link href="/invoices"><Button variant="outline">Cancel</Button></Link>
        <Button variant="outline" onClick={(e) => handleSubmit(e, "draft")} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Save Draft
        </Button>
        <Button variant="gradient" onClick={(e) => handleSubmit(e, "send")} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Send Invoice
        </Button>
      </div>
    </div>
  );
}
