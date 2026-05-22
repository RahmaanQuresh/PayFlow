import React from "react";
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";

interface InvoicePdfProps {
  invoice: {
    invoiceNumber: string;
    title: string;
    status: string;
    issueDate: Date;
    dueDate: Date;
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    discountAmount: number;
    total: number;
    paidAmount: number;
    currency: string;
    notes?: string | null;
    paidAt?: Date | null;
    viewedAt?: Date | null;
  };
  client: {
    name: string;
    email: string;
    company?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    country?: string | null;
  };
  freelancer: {
    name: string;
    email: string;
    businessName?: string | null;
    addressLine1?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
  };
  lineItems: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
}

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#1f2937" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 },
  logo: { fontSize: 24, fontFamily: "Helvetica-Bold", color: "#7c3aed" },
  badge: { fontSize: 10, padding: 6, borderRadius: 4, textTransform: "uppercase" },
  section: { marginBottom: 20 },
  addressRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 },
  addressBox: { width: "45%", fontSize: 9 },
  label: { fontSize: 9, color: "#6b7280", marginBottom: 2, fontFamily: "Helvetica-Bold" },
  table: { marginBottom: 20 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    padding: 8,
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    borderBottom: "1px solid #d1d5db",
  },
  tableRow: { flexDirection: "row", padding: 8, borderBottom: "1px solid #e5e7eb", fontSize: 9 },
  colDesc: { flex: 4 },
  colQty: { flex: 1, textAlign: "right" },
  colRate: { flex: 2, textAlign: "right" },
  colAmt: { flex: 2, textAlign: "right" },
  totalsSection: { marginLeft: "auto", width: "45%" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, fontSize: 9 },
  totalRowBold: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    borderTop: "2px solid #1f2937",
    marginTop: 4,
  },
  statusBadge: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 8,
  },
  notes: { fontSize: 9, color: "#6b7280", marginTop: 20 },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#9ca3af",
    textAlign: "center",
  },
});

function statusColor(status: string): string {
  switch (status) {
    case "PAID": return "#059669";
    case "OVERDUE": return "#dc2626";
    case "DRAFT": return "#9ca3af";
    default: return "#2563eb";
  }
}

function formatAddr(a: Record<string, string | null | undefined>): string {
  const parts = [a.addressLine1, a.addressLine2, a.city, a.state, a.postalCode, a.country];
  return parts.filter(Boolean).join(", ");
}

export function InvoicePdfDocument({ invoice, client, freelancer, lineItems }: InvoicePdfProps) {
  const balance = invoice.total - (invoice.paidAmount || 0);
  const statusLabel = invoice.status === "DRAFT"
    ? "DRAFT — Not yet sent"
    : invoice.status === "PAID"
    ? `Paid on ${invoice.paidAt || ""}`
    : invoice.status === "OVERDUE"
    ? "OVERDUE — Payment past due"
    : `Sent — Awaiting payment`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.logo}>{freelancer.businessName || freelancer.name}</Text>
          <View>
            <Text style={[styles.badge, { color: statusColor(invoice.status), backgroundColor: "#f9fafb" }]}>
              {invoice.status}
            </Text>
          </View>
        </View>

        <Text style={styles.statusBadge}>{statusLabel}</Text>

        <View style={styles.addressRow}>
          <View style={styles.addressBox}>
            <Text style={styles.label}>From</Text>
            <Text>{freelancer.businessName || freelancer.name}</Text>
            <Text>{freelancer.email}</Text>
            <Text>{formatAddr(freelancer)}</Text>
          </View>
          <View style={styles.addressBox}>
            <Text style={styles.label}>Bill To</Text>
            <Text>{client.company || client.name}</Text>
            <Text>{client.email}</Text>
            <Text>{formatAddr(client)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Invoice {invoice.invoiceNumber}</Text>
          <Text>{invoice.title}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>Description</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colRate}>Rate</Text>
            <Text style={styles.colAmt}>Amount</Text>
          </View>
          {lineItems.map((item, i) => (
            <View style={styles.tableRow} key={i}>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colRate}>${item.rate.toFixed(2)}</Text>
              <Text style={styles.colAmt}>${item.amount.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>${invoice.subtotal.toFixed(2)}</Text>
          </View>
          {invoice.taxAmount > 0 && (
            <View style={styles.totalRow}>
              <Text>Tax ({invoice.taxRate}%)</Text>
              <Text>${invoice.taxAmount.toFixed(2)}</Text>
            </View>
          )}
          {invoice.discountAmount > 0 && (
            <View style={styles.totalRow}>
              <Text>Discount</Text>
              <Text>-${invoice.discountAmount.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.totalRowBold}>
            <Text>Total ({invoice.currency})</Text>
            <Text>${invoice.total.toFixed(2)}</Text>
          </View>
          {invoice.paidAmount > 0 && (
            <View style={styles.totalRow}>
              <Text>Paid</Text>
              <Text>-${invoice.paidAmount.toFixed(2)}</Text>
            </View>
          )}
          {balance > 0 && (
            <View style={[styles.totalRow, { fontFamily: "Helvetica-Bold", color: "#dc2626" }]}>
              <Text>Balance Due</Text>
              <Text>${balance.toFixed(2)}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Dates</Text>
          <Text>Issued: {new Date(invoice.issueDate).toLocaleDateString()}</Text>
          <Text>Due: {new Date(invoice.dueDate).toLocaleDateString()}</Text>
        </View>

        {invoice.notes && <Text style={styles.notes}>Notes: {invoice.notes}</Text>}

        <Text style={styles.footer}>
          Generated by PayFlow | {new Date().toLocaleDateString()}
        </Text>
      </Page>
    </Document>
  );
}

export async function generateInvoicePdf(data: InvoicePdfProps): Promise<Buffer> {
  return renderToBuffer(<InvoicePdfDocument {...data} />);
}
