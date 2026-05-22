import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Please enter a valid email address"),
  company: z.string().max(255).optional(),
  phone: z.string().max(50).optional(),
  addressLine1: z.string().max(255).optional(),
  addressLine2: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().max(100).default("US"),
  notes: z.string().optional(),
});

export const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required").max(500),
  quantity: z.number().positive("Quantity must be positive").default(1),
  rate: z.number().positive("Rate must be positive"),
  taxable: z.boolean().default(true),
});

export const invoiceSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  issueDate: z.string().datetime().default(() => new Date().toISOString()),
  dueDate: z.string().datetime(),
  paymentTerms: z.enum(["net7", "net14", "net30", "custom"]).default("net30"),
  currency: z.enum(["USD", "INR"]).default("USD"),
  lineItems: z.array(lineItemSchema).min(1, "At least one line item is required"),
  discountType: z.enum(["percentage", "fixed"]).optional(),
  discountValue: z.number().min(0).default(0),
  taxRate: z.number().min(0).max(100).default(0),
  notes: z.string().optional(),
  reminderSequenceId: z.string().optional(),
});

export const reminderStepSchema = z.object({
  daysAfterDue: z.number().int().positive(),
  tone: z.enum(["friendly", "formal", "direct", "legal"]).default("friendly"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
  useAi: z.boolean().default(false),
});

export const reminderSequenceSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().optional(),
  isDefault: z.boolean().default(false),
  steps: z.array(reminderStepSchema).min(1, "At least one step is required"),
});
