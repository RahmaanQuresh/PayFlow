import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: String(credentials.email) },
        });
        if (!user?.password) return null;
        const ok = await bcrypt.compare(String(credentials.password), user.password);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET || "d8b8c569eae175baa067de60f36540912e9baa357e2c20150a1d3e4e7c04b8c4",
  trustHost: true,
});
