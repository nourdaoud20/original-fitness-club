import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function requireRole(allowedRoles: string[]) {
  const session = await getSession();
  if (!session) {
    return { ok: false as const, status: 401, error: "Non authentifié" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      matricule: true,
      subscriptionEnd: true,
      fairPlayBlockedUntil: true,
      absencesCount: true,
    },
  });

  if (!user) {
    return { ok: false as const, status: 401, error: "Utilisateur introuvable" };
  }

  if (!allowedRoles.includes(user.role)) {
    return { ok: false as const, status: 403, error: "Accès interdit" };
  }

  return { ok: true as const, user };
}