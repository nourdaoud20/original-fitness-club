import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation";
import { createSession } from "@/lib/session";

export async function POST(req: Request) {
  // 1. Récupération w Validation mta3 les données
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }
  const { name, email, password } = parsed.data;

  // 2. Vérification ken l'email mawjoud
  const existing = await prisma.user.findUnique({
    where: { email },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Cet email est déjà utilisé" },
      { status: 409 }
    );
  }

  // 3. Hachage mta3 mot de passe w création mta3 l'utilisateur
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hash }, // Role yemchi "MEMBER" par défaut kima fel schéma
  });

  // 4. Création mta3 l'session JWT
  await createSession(user.id, user.role);

  // 5. Réponse (ma nraj3ouch l'mot de passe!)
  return NextResponse.json(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    { status: 201 }
  );
}