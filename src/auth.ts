import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signToken, setSessionCookie, clearSessionCookie, getSession } from "@/lib/auth/jwt";

export async function login(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    return { ok: false, error: "Invalid email or password" };
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return { ok: false, error: "Invalid email or password" };
  }

  const token = await signToken({
    id: user.id,
    email: user.email,
    name: user.name,
  });

  await setSessionCookie(token);
  return { ok: true };
}

export async function logout() {
  await clearSessionCookie();
}

export { getSession };
