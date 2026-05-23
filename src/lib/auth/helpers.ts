import { getSession } from "@/auth";

export async function getSessionUserId(): Promise<string> {
  const session = await getSession();
  if (!session?.id) {
    throw new Error("Unauthorized: No valid session found");
  }
  return session.id;
}

export { getSession };
