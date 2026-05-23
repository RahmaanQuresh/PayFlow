import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return Response.json({ ok: false, reason: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    return Response.json({ ok: match, reason: match ? "success" : "Wrong password" });
  } catch (e: any) {
    return Response.json({ ok: false, reason: e.message, stack: e.stack }, { status: 500 });
  }
}
