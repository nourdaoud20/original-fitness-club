import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation";
import { createSession } from "@/lib/session";

export async function POST(req: Request) {
  // 1. Validation mta3 l'entrée
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }
  const { email, password } = parsed.data;

  // 2. Récupération mta3 l'utilisateur
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // 3. Vérification mta3 l'mot de passe
  const ok = user ? await bcrypt.compare(password, user.password) : false;

  // Même message générique pour email inconnu ou mauvais mot de passe
  if (!user || !ok) {
    return NextResponse.json(
      { error: "Identifiants invalides" },
      { status: 401 }
    );
  }

  // 4. Création mta3 l'session JWT
  await createSession(user.id, user.role);

  return NextResponse.json({
    id: user.id, name: user.name, email: user.email, role: user.role,
  });
}