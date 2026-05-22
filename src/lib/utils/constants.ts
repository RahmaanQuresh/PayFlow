export const INVOICE_STATUSES = [
  "draft",
  "sent",
  "viewed",
  "overdue",
  "paid",
  "partially_paid",
  "canceled",
] as const;

export const REMINDER_TONES = ["friendly", "formal", "direct", "legal"] as const;

export const SUBSCRIPTION_PLANS = {
  free: { name: "Free", price: 0, invoices: 3, clients: 5, reminders: 3 },
  premium: { name: "Premium", price: 19, priceAnnual: 190, invoices: -1, clients: -1, reminders: -1 },
  team: { name: "Team", price: 49, priceAnnual: 490, invoices: -1, clients: -1, reminders: -1 },
} as const;
