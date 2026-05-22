import { Resend } from "resend";

let resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const from = process.env.EMAIL_FROM || "noreply@payflow.app";

export async function sendInvoiceEmail(params: {
  to: string;
  invoiceNumber: string;
  clientName: string;
  portalUrl: string;
  freelancerName: string;
  amount: number;
  dueDate: Date;
}) {
  const client = getResend();
  if (!client) return null;

  return client.emails.send({
    from,
    to: params.to,
    subject: `Invoice ${params.invoiceNumber} from ${params.freelancerName}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: sans-serif;">
        <h2>Invoice ${params.invoiceNumber}</h2>
        <p>Hi ${params.clientName},</p>
        <p>A new invoice has been created for you:</p>
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <div style="margin-bottom: 8px;"><b>Amount:</b> $${params.amount.toLocaleString()}</div>
          <div style="margin-bottom: 8px;"><b>Due Date:</b> ${params.dueDate.toLocaleDateString()}</div>
        </div>
        <p>
          <a href="${params.portalUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
            View & Pay Invoice
          </a>
        </p>
        <p style="color: #6b7280; font-size: 14px;">
          Best regards,<br/>${params.freelancerName}
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">
          Powered by PayFlow
        </p>
      </div>
    `,
  });
}

export async function sendReminderEmail(params: {
  to: string;
  clientName: string;
  invoiceNumber: string;
  amount: number;
  dueDate: Date;
  daysOverdue: number;
  subject: string;
  body: string;
  portalUrl: string;
  freelancerName: string;
}) {
  const client = getResend();
  if (!client) return null;

  return client.emails.send({
    from,
    to: params.to,
    subject: params.subject,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: sans-serif;">
        <div style="background: ${params.daysOverdue >= 30 ? '#fef2f2' : '#fff7ed'}; border-left: 4px solid ${params.daysOverdue >= 30 ? '#dc2626' : '#f59e0b'}; padding: 16px; margin-bottom: 20px; border-radius: 4px;">
          <strong>${params.daysOverdue} days overdue</strong>
        </div>
        <p>Hi ${params.clientName},</p>
        <div style="white-space: pre-wrap; line-height: 1.6;">${params.body}</div>
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <div style="margin-bottom: 8px;"><b>Invoice:</b> ${params.invoiceNumber}</div>
          <div style="margin-bottom: 8px;"><b>Amount:</b> $${params.amount.toLocaleString()}</div>
          <div><b>Due Date:</b> ${params.dueDate.toLocaleDateString()}</div>
        </div>
        <p>
          <a href="${params.portalUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
            View & Pay Invoice
          </a>
        </p>
        <p style="color: #6b7280; font-size: 14px;">
          ${params.freelancerName}
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">
          Powered by PayFlow
        </p>
      </div>
    `,
  });
}

export async function sendPaymentReceivedEmail(params: {
  to: string;
  invoiceNumber: string;
  amount: number;
  clientName: string;
}) {
  const client = getResend();
  if (!client) return null;

  return client.emails.send({
    from,
    to: params.to,
    subject: `Payment Received - Invoice ${params.invoiceNumber}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: sans-serif;">
        <h2>Payment Received ✓</h2>
        <p>Hi ${params.clientName},</p>
        <p>Your payment of <b>$${params.amount.toLocaleString()}</b> for invoice ${params.invoiceNumber} has been received.</p>
        <p style="color: #6b7280; font-size: 14px;">
          Thank you for your payment!
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">
          Powered by PayFlow
        </p>
      </div>
    `,
  });
}
