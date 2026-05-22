import { prisma } from "@/lib/db";
import { Resend } from "resend";
import crypto from "crypto";

const from = process.env.EMAIL_FROM || "noreply@payflow.app";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

export async function createPasswordResetToken(email: string): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.verificationToken.deleteMany({
    where: { email, type: "PASSWORD_RESET" },
  });

  await prisma.verificationToken.create({
    data: {
      email,
      token,
      type: "PASSWORD_RESET",
      expiresAt,
    },
  });

  return token;
}

export async function validateResetToken(token: string): Promise<string | null> {
  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record || record.type !== "PASSWORD_RESET") return null;
  if (new Date() > record.expiresAt) {
    await prisma.verificationToken.delete({ where: { id: record.id } });
    return null;
  }

  return record.email;
}

export async function consumeResetToken(token: string): Promise<void> {
  await prisma.verificationToken.deleteMany({ where: { token } });
}

export async function sendResetEmail(email: string, token: string) {
  const client = getResendClient();
  if (!client) return null;

  const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;

  return client.emails.send({
    from,
    to: email,
    subject: "Reset your PayFlow password",
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: sans-serif;">
        <h2>Reset Your Password</h2>
        <p>You requested a password reset for your PayFlow account.</p>
        <p>Click the button below to reset your password. This link expires in 1 hour.</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
            Reset Password
          </a>
        </p>
        <p style="color: #6b7280; font-size: 14px;">
          If you didn't request this, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">
          Powered by PayFlow
        </p>
      </div>
    `,
  });
}
