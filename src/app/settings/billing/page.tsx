"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check, Star } from "lucide-react";
import { useState } from "react";

export default function BillingPage() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href="/settings">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="font-display font-extrabold text-2xl">Billing</h1>
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle>Current Plan</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-5 rounded-2xl border-2 border-foreground bg-muted/20">
            <div>
              <div className="font-extrabold text-lg">Free Plan</div>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1.5 font-medium">
                {["3 active invoices", "5 clients", "Basic reminders"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-quaternary/20">
                      <Check className="h-3 w-3 text-quaternary" strokeWidth={3} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <Button variant="gradient">Upgrade to Premium</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Upgrade Options</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm font-bold transition-colors ${billing === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
            <button
              onClick={() => setBilling((c) => (c === "monthly" ? "annual" : "annual"))}
              className="relative h-8 w-14 rounded-full bg-muted p-1 border-2 border-foreground transition-all hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <div className={`h-5 w-5 rounded-full bg-gradient-to-r from-primary to-secondary shadow-hard-sm transition-transform duration-300 ${billing === "annual" ? "translate-x-6" : "translate-x-0"}`} />
            </button>
            <span className={`text-sm font-bold transition-colors flex items-center gap-2 ${billing === "annual" ? "text-foreground" : "text-muted-foreground"}`}>
              Annual
              <span className="rounded-full bg-tertiary/20 border-2 border-tertiary px-2 py-0.5 text-[10px] font-black uppercase text-tertiary">Save 20%</span>
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {[
              { name: "Premium", price: billing === "monthly" ? "$19" : "$15", period: "/month", billed: billing === "annual" ? "Billed $190/year" : "Billed monthly", features: ["Unlimited invoices", "AI tone adaptation", "Legal escalation", "Priority support"], highlight: true },
              { name: "Team", price: billing === "monthly" ? "$49" : "$39", period: "/month", billed: billing === "annual" ? "Billed $490/year" : "Billed monthly", features: ["Everything in Premium", "3 team members", "API access", "Custom branding"], highlight: false },
            ].map((plan) => (
              <div key={plan.name} className={`relative rounded-2xl border-2 border-foreground p-6 bouncy hover:-translate-y-[4px] hover:shadow-hard-lg flex flex-col ${plan.highlight ? "shadow-hard" : "shadow-hard-sm bg-card"}`}>
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-tertiary to-orange-400 border-2 border-foreground px-4 py-1 text-xs font-black uppercase tracking-wider text-foreground shadow-hard-sm -rotate-3">
                    <Star className="h-3 w-3 inline mr-1" />Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-display font-extrabold text-2xl">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground font-medium mt-1">{plan.billed}</p>
                </div>
                <div className="mb-6 flex items-baseline gap-1">
                  <span className="font-display font-black text-5xl">{plan.price}</span>
                  <span className="text-sm text-muted-foreground font-bold">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm font-bold">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-quaternary/20 mt-0.5">
                        <Check className="h-3 w-3 text-quaternary" strokeWidth={3} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button variant={plan.highlight ? "gradient" : "outline"} className="w-full" size="lg">Choose {plan.name}</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
