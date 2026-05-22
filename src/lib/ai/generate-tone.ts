import OpenAI from "openai";

function getClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function generateToneAdaptedReminder(params: {
  originalSubject: string;
  originalBody: string;
  tone: "friendly" | "formal" | "direct" | "legal";
  toneSamples: Array<{ content: string; context: string | null }>;
  context: {
    clientName: string;
    invoiceNumber: string;
    amount: number;
    daysOverdue: number;
    freelancerName: string;
  };
}): Promise<{ subject: string; body: string }> {
  const openai = getClient();
  if (!openai) {
    return { subject: params.originalSubject, body: params.originalBody };
  }

  const toneDescriptions: Record<string, string> = {
    friendly: "warm and approachable, like a gentle nudge between friends",
    formal: "professional and business-like, maintaining clear boundaries",
    direct: "straightforward and urgent, no fluff — payment is required now",
    legal: "firm and legally precise, referencing potential escalation",
  };

  const toneSampleText = params.toneSamples.length
    ? `\nHere are examples of this freelancer's communication style:\n${params.toneSamples
        .map((s) => `- [${s.context || "General"}]: "${s.content}"`)
        .join("\n")}`
    : "";

  const prompt = `Rewrite the following payment reminder email in a ${params.tone} tone (${toneDescriptions[params.tone]}).${toneSampleText}

Context:
- Client: ${params.context.clientName}
- Invoice: ${params.context.invoiceNumber}
- Amount: $${params.context.amount}
- Days Overdue: ${params.context.daysOverdue}
- Freelancer: ${params.context.freelancerName}

Original Subject: ${params.originalSubject}
Original Body:
${params.originalBody}

Return ONLY valid JSON with "subject" and "body" keys. The body should use \n for line breaks.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 500,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    return { subject: params.originalSubject, body: params.originalBody };
  }

  try {
    const parsed = JSON.parse(content);
    return {
      subject: parsed.subject || params.originalSubject,
      body: parsed.body || params.originalBody,
    };
  } catch {
    return { subject: params.originalSubject, body: params.originalBody };
  }
}

export async function generateLegalDemandLetter(params: {
  clientName: string;
  clientCompany: string;
  invoiceNumber: string;
  amount: number;
  daysOverdue: number;
  freelancerName: string;
  freelancerBusinessName: string;
  freelancerAddress: string;
  jurisdiction: string;
}): Promise<{ subject: string; body: string }> {
  const openai = getClient();
  if (!openai) {
    return {
      subject: `Legal Notice: Outstanding Invoice ${params.invoiceNumber}`,
      body: `Dear ${params.clientName},\n\nThis is a formal demand for payment of invoice ${params.invoiceNumber} in the amount of $${params.amount}, now ${params.daysOverdue} days past due.\n\nSincerely,\n${params.freelancerName}`,
    };
  }

  const prompt = `Draft a legal demand letter for an overdue invoice:

- Client: ${params.clientName}${params.clientCompany ? ` of ${params.clientCompany}` : ""}
- Invoice: ${params.invoiceNumber}
- Amount: $${params.amount}
- Days Overdue: ${params.daysOverdue}
- Freelancer: ${params.freelancerName} of ${params.freelancerBusinessName}
- Freelancer Address: ${params.freelancerAddress}
- Jurisdiction: ${params.jurisdiction}

Include: a clear demand for payment, a deadline (10 business days from now), reference to potential legal action, and a payment link placeholder {portal_url}.

Return ONLY valid JSON with "subject" and "body" keys. The body should use \n for line breaks.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 1000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    return {
      subject: `Legal Notice: Outstanding Invoice ${params.invoiceNumber}`,
      body: `Dear ${params.clientName},\n\nThis is a formal demand for payment.\n\nSincerely,\n${params.freelancerName}`,
    };
  }

  try {
    const parsed = JSON.parse(content);
    return { subject: parsed.subject, body: parsed.body };
  } catch {
    return {
      subject: `Legal Notice: Outstanding Invoice ${params.invoiceNumber}`,
      body: `Dear ${params.clientName},\n\nThis is a formal demand for payment.\n\nSincerely,\n${params.freelancerName}`,
    };
  }
}
