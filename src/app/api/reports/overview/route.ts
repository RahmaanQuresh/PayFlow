import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth/helpers";
import { successResponse, apiError } from "@/lib/utils/errors";

export async function GET() {
  try {
    const userId = await getSessionUserId();

    const invoices = await prisma.invoice.findMany({
      where: { userId },
      select: {
        id: true,
        status: true,
        total: true,
        paidAmount: true,
        issueDate: true,
        dueDate: true,
        paidAt: true,
        clientId: true,
        client: { select: { id: true, name: true } },
      },
      orderBy: { issueDate: "asc" },
    });

    const remindersSent = await prisma.reminderSent.findMany({
      where: { invoice: { userId } },
      select: {
        id: true,
        invoiceId: true,
        tone: true,
        deliveryStatus: true,
        sentAt: true,
        stepNumber: true,
      },
    });

    const clients = await prisma.client.findMany({
      where: { userId, deletedAt: null },
      select: {
        id: true,
        name: true,
        totalInvoiced: true,
        totalPaid: true,
        totalOutstanding: true,
        invoiceCount: true,
      },
    });

    const now = new Date();

    // Status breakdown for pie chart
    const statusCounts: Record<string, number> = {};
    const statusAmounts: Record<string, number> = {};
    for (const inv of invoices) {
      statusCounts[inv.status] = (statusCounts[inv.status] || 0) + 1;
      statusAmounts[inv.status] = (statusAmounts[inv.status] || 0) + Number(inv.total);
    }

    // Monthly revenue (last 12 months)
    const monthlyRevenue: { month: string; revenue: number; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthKey = monthStart.toLocaleString("en-US", { month: "short", year: "2-digit" });

      const monthInvoices = invoices.filter((inv) => {
        const paid = inv.paidAt ? new Date(inv.paidAt) : null;
        return paid && paid >= monthStart && paid <= monthEnd && inv.status === "paid";
      });

      monthlyRevenue.push({
        month: monthKey,
        revenue: monthInvoices.reduce((s, inv) => s + Number(inv.total), 0),
        count: monthInvoices.length,
      });
    }

    // Overdue trends (last 6 months - count of invoices overdue at month end)
    const overdueTrends: { month: string; count: number; amount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthKey = monthEnd.toLocaleString("en-US", { month: "short", year: "2-digit" });

      const overdueInvoices = invoices.filter((inv) => {
        const due = new Date(inv.dueDate);
        const isPaidOrCanceled = inv.status === "paid" || inv.status === "canceled";
        // Invoice was overdue as of this month end if due date is before month end AND it wasn't paid/canceled before month end
        if (due > monthEnd) return false;
        if (isPaidOrCanceled && inv.paidAt && new Date(inv.paidAt) <= monthEnd) return false;
        if (inv.status === "canceled") return false;
        return true;
      });

      overdueTrends.push({
        month: monthKey,
        count: overdueInvoices.length,
        amount: overdueInvoices.reduce((s, inv) => s + Number(inv.total) - Number(inv.paidAmount), 0),
      });
    }

    // Aging buckets
    const aging: { bucket: string; count: number; amount: number }[] = [
      { bucket: "0-30 days", count: 0, amount: 0 },
      { bucket: "31-60 days", count: 0, amount: 0 },
      { bucket: "61-90 days", count: 0, amount: 0 },
      { bucket: "90+ days", count: 0, amount: 0 },
    ];

    const outstanding = invoices.filter(
      (inv) => inv.status !== "paid" && inv.status !== "canceled"
    );
    for (const inv of outstanding) {
      const daysOverdue = Math.floor(
        (now.getTime() - new Date(inv.dueDate).getTime()) / 86400000
      );
      const amount = Number(inv.total) - Number(inv.paidAmount);
      if (daysOverdue <= 30) {
        aging[0].count++; aging[0].amount += amount;
      } else if (daysOverdue <= 60) {
        aging[1].count++; aging[1].amount += amount;
      } else if (daysOverdue <= 90) {
        aging[2].count++; aging[2].amount += amount;
      } else {
        aging[3].count++; aging[3].amount += amount;
      }
    }

    // Client performance
    const clientPerformance = clients.map((c) => {
      const clientInvoices = invoices.filter((inv) => inv.clientId === c.id);
      const paidInvoices = clientInvoices.filter((inv) => inv.status === "paid");
      const avgDaysToPay = paidInvoices.length
        ? Math.round(
            paidInvoices.reduce((sum, inv) => {
              const paid = inv.paidAt ? new Date(inv.paidAt) : now;
              const issued = new Date(inv.issueDate);
              return sum + (paid.getTime() - issued.getTime()) / 86400000;
            }, 0) / paidInvoices.length
          )
        : 0;

      return {
        id: c.id,
        name: c.name,
        totalInvoiced: c.totalInvoiced,
        totalPaid: c.totalPaid,
        totalOutstanding: c.totalOutstanding,
        invoiceCount: c.invoiceCount,
        overdueCount: clientInvoices.filter((inv) => inv.status === "overdue").length,
        avgDaysToPay,
      };
    });

    // Reminder effectiveness
    const totalReminders = remindersSent.length;
    const deliveredReminders = remindersSent.filter(
      (r) => r.deliveryStatus === "DELIVERED" || r.deliveryStatus === "SENT"
    ).length;
    const openedReminders = remindersSent.filter((r) => r.deliveryStatus === "OPENED").length;

    // By tone
    const toneEffectiveness: Record<string, { sent: number; delivered: number; opened: number }> = {};
    for (const r of remindersSent) {
      if (!toneEffectiveness[r.tone]) {
        toneEffectiveness[r.tone] = { sent: 0, delivered: 0, opened: 0 };
      }
      toneEffectiveness[r.tone].sent++;
      if (r.deliveryStatus === "DELIVERED" || r.deliveryStatus === "SENT" || r.deliveryStatus === "OPENED") {
        toneEffectiveness[r.tone].delivered++;
      }
      if (r.deliveryStatus === "OPENED") {
        toneEffectiveness[r.tone].opened++;
      }
    }

    // Payments received after reminders (step-based)
    const invoicesThatGotPaid = invoices.filter((inv) => inv.status === "paid");
    const remindersPerPaidInvoice = invoicesThatGotPaid.map((inv) => {
      const reminders = remindersSent.filter((r) => r.invoiceId === inv.id);
      return reminders.length;
    });
    const avgRemindersToPay = remindersPerPaidInvoice.length
      ? Math.round(remindersPerPaidInvoice.reduce((s, n) => s + n, 0) / remindersPerPaidInvoice.length * 10) / 10
      : 0;

    return successResponse({
      statusCounts,
      statusAmounts,
      monthlyRevenue,
      overdueTrends,
      aging,
      clientPerformance,
      reminderEffectiveness: {
        totalReminders,
        deliveredReminders,
        openedReminders,
        deliveryRate: totalReminders ? Math.round((deliveredReminders / totalReminders) * 100) : 0,
        openRate: totalReminders ? Math.round((openedReminders / totalReminders) * 100) : 0,
        avgRemindersToPay,
        byTone: Object.entries(toneEffectiveness).map(([tone, data]) => ({
          tone,
          ...data,
          deliveryRate: data.sent ? Math.round((data.delivered / data.sent) * 100) : 0,
        })),
      },
    });
  } catch (error) {
    console.error("GET /api/reports/overview error:", error);
    return apiError("INTERNAL_ERROR", "Failed to load report data", 500);
  }
}
