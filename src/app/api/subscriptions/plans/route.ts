import { successResponse, apiError } from "@/lib/utils/errors";

export async function GET() {
  try {
    const plans = [
      {
        id: "free",
        name: "Free",
        price: 0,
        features: ["3 active invoices", "5 clients", "Basic reminders"],
        limits: { invoices: 3, clients: 5, reminders: 3 },
      },
      {
        id: "premium",
        name: "Premium",
        price: 19,
        priceAnnual: 190,
        features: ["Unlimited invoices", "Unlimited clients", "AI tone adaptation", "Legal escalation", "Advanced reports"],
        limits: { invoices: -1, clients: -1, reminders: -1 },
      },
      {
        id: "team",
        name: "Team",
        price: 49,
        priceAnnual: 490,
        features: ["Everything in Premium", "3 team members", "API access"],
        limits: { invoices: -1, clients: -1, reminders: -1 },
      },
    ];

    return successResponse({ plans });
  } catch (error) {
    console.error("GET /api/subscriptions/plans error:", error);
    return apiError("INTERNAL_ERROR", "Failed to fetch plans", 500);
  }
}
