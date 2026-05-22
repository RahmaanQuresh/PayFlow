import type { INVOICE_STATUSES, REMINDER_TONES } from "@/lib/utils/constants";

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];
export type ReminderTone = (typeof REMINDER_TONES)[number];

export interface Client {
  id: string;
  userId: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  notes: string | null;
  totalInvoiced: number;
  totalPaid: number;
  totalOutstanding: number;
  invoiceCount: number;
  lastInvoiceDate: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LineItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  taxable: boolean;
  sortOrder: number;
}

export interface Invoice {
  id: string;
  userId: string;
  clientId: string;
  invoiceNumber: string;
  title: string;
  description: string | null;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  paymentTerms: string;
  currency: string;
  subtotal: number;
  discountType: string | null;
  discountValue: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  paidAmount: number;
  notes: string | null;
  currentReminderStep: number;
  nextReminderDate: Date | null;
  remindersEnabled: boolean;
  remindersPaused: boolean;
  portalToken: string | null;
  sentAt: Date | null;
  viewedAt: Date | null;
  paidAt: Date | null;
  canceledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  client?: Client;
  lineItems?: LineItem[];
  payments?: Payment[];
}

export interface Payment {
  id: string;
  invoiceId: string;
  userId: string;
  clientId: string;
  amount: number;
  method: "card" | "paypal" | "upi" | "bank" | "other";
  status: "pending" | "completed" | "failed" | "refunded";
  stripePaymentIntentId: string | null;
  razorpayOrderId: string | null;
  paidAt: Date | null;
  createdAt: Date;
}

export interface ReminderSequence {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  isActive: boolean;
  steps?: ReminderStep[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ReminderStep {
  id: string;
  sequenceId: string;
  daysAfterDue: number;
  tone: ReminderTone;
  subject: string;
  body: string;
  useAi: boolean;
  sortOrder: number;
}
