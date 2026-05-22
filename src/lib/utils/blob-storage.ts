import { put, del, list } from "@vercel/blob";
import crypto from "crypto";

function isConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function uploadPdf(
  buffer: Buffer,
  invoiceNumber: string,
  userId: string
): Promise<string | null> {
  if (!isConfigured()) return null;

  const filename = `invoices/${userId}/${invoiceNumber}-${crypto.randomBytes(4).toString("hex")}.pdf`;

  const blob = await put(filename, buffer, {
    access: "public",
    contentType: "application/pdf",
  });

  return blob.url;
}

export async function deletePdf(url: string): Promise<void> {
  if (!isConfigured()) return;
  await del(url);
}

export async function listUserPdfs(userId: string): Promise<string[]> {
  if (!isConfigured()) return [];

  const { blobs } = await list({ prefix: `invoices/${userId}/` });
  return blobs.map((b) => b.url);
}
