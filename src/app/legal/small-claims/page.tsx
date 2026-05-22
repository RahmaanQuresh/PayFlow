"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check, ExternalLink, FileText, Scale } from "lucide-react";

const steps = [
  {
    number: 1,
    title: "Determine Eligibility",
    description: "Most small claims courts handle disputes up to a certain dollar limit ($3,000–$10,000 depending on jurisdiction). Verify your claim qualifies.",
    items: ["Confirm the dollar amount is within limits", "Ensure the dispute is about money (not property)", "Check the statute of limitations hasn't expired"],
  },
  {
    number: 2,
    title: "Send a Demand Letter",
    description: "Before filing, most courts require you to have made a formal demand for payment. Use PayFlow's demand letter generator.",
    items: ["Send a formal demand letter with payment deadline", "Keep a copy for your records", "Wait the specified response period (typically 10-30 days)"],
    action: { label: "Generate Demand Letter", href: "/legal/demand-letter" },
  },
  {
    number: 3,
    title: "File Your Claim",
    description: "If payment isn't received, file a claim with the small claims court in the appropriate jurisdiction.",
    items: ["Determine the correct court (usually where the defendant resides or does business)", "Complete the complaint form", "Pay the filing fee (typically $30–$100)", "Include all relevant documents: invoices, contracts, email correspondence"],
  },
  {
    number: 4,
    title: "Serve the Defendant",
    description: "The defendant must be formally notified of the lawsuit through proper service of process.",
    items: ["Hire a process server or use certified mail", "File proof of service with the court", "Ensure service is completed within the court's deadline"],
  },
  {
    number: 5,
    title: "Prepare for Court",
    description: "Organize your evidence and prepare your testimony for the hearing.",
    items: ["Bring all original documents and copies", "Prepare a clear, chronological summary of events", "Bring the demand letter and proof of delivery", "Consider bringing a witness if applicable"],
  },
  {
    number: 6,
    title: "Attend the Hearing",
    description: "Present your case clearly and professionally before the judge.",
    items: ["Arrive early and dress professionally", "Present facts chronologically without emotional language", "Answer questions directly and honestly", "Bring copies of all documents for the judge and defendant"],
  },
];

export default function SmallClaimsPage() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href="/legal"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="font-display font-extrabold text-2xl">Small Claims Court Guide</h1>
      </div>

      <Card className="mb-6">
        <CardContent className="py-5">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-tertiary to-orange-400 border-2 border-foreground shadow-hard-sm">
              <Scale className="h-6 w-6 text-foreground" strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-bold text-lg">Before You File</p>
              <p className="text-sm text-muted-foreground font-medium mt-1">
                Small claims court is designed for resolving disputes without a lawyer. This guide walks you through the process step by step. However, this information is for educational purposes only and does not constitute legal advice.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {steps.map((step) => (
          <Card key={step.number} className="group hover:-translate-y-[2px] hover:shadow-hard-lg">
            <CardHeader className="flex flex-row gap-4 items-start">
              <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white font-black border-2 border-foreground shadow-hard-sm">
                {step.number}
              </div>
              <div className="flex-1">
                <CardTitle className="text-base">{step.title}</CardTitle>
                <p className="text-sm text-muted-foreground font-medium mt-1">{step.description}</p>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                {step.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm font-medium">
                    <Check className="h-4 w-4 text-quaternary mt-0.5 shrink-0" strokeWidth={2.5} />
                    {item}
                  </li>
                ))}
              </ul>
              {step.action && (
                <Link href={step.action.href}>
                  <Button variant="outline" size="sm"><FileText className="h-4 w-4 mr-2" />{step.action.label}</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardContent className="py-5">
          <div className="flex items-start gap-4">
            <ExternalLink className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-bold">Additional Resources</p>
              <ul className="text-sm text-muted-foreground font-medium space-y-1 mt-2">
                <li>• <a href="https://www.usa.gov/small-claims-court" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">USA.gov — Small Claims Court Overview</a></li>
                <li>• <a href="https://www.nolo.com/legal-encyclopedia/small-claims-court" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Nolo — Small Claims Court Resources</a></li>
                <li>• Check your state&rsquo;s judiciary website for specific rules, forms, and fee schedules</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
