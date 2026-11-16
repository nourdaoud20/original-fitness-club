import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

function addMonths(baseDate: Date, months: number): Date {
  const result = new Date(baseDate);
  result.setMonth(result.getMonth() + months);
  return result;
}

// Créer un nouvel adhérent après paiement à la caisse
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "RECEPTIONIST")) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { name, email, phone, matricule, password, durationMonths, amountPaid } = await req.json();

    if (!name || !email || !matricule || !password) {
      return NextResponse.json(
        { error: "Nom, email, matricule et mot de passe requis" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { matricule }] },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Cet email ou ce matricule existe déjà dans la base" },
        { status: 409 }
      );
    }

    const months = Number(durationMonths) || 1;
    const now = new Date();
    const subscriptionEnd = addMonths(now, months);
    const hashedPassword = await bcrypt.hash(password, 10);

    const member = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        matricule,
        password: hashedPassword,
        role: "MEMBER",
        subscriptionEnd,
        transactions: {
          create: {
            planName: `${months} mois`,
            amount: Number(amountPaid) || 0,
            durationMonths: months,
            processedBy: `${session.role} #${session.userId}`,
          },
        },
      },
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    console.error("Erreur création adhérent:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Renouveler l'abonnement d'un adhérent existant (+1, +3, +12 mois)
export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "RECEPTIONIST")) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { memberId, durationMonths, amountPaid } = await req.json();
    const member = await prisma.user.findUnique({ where: { id: Number(memberId) } });
    if (!member) {
      return NextResponse.json({ error: "Adhérent introuvable" }, { status: 404 });
    }

    const months = Number(durationMonths) || 1;
    const now = new Date();
    const baseDate =
      member.subscriptionEnd && member.subscriptionEnd > now ? member.subscriptionEnd : now;
    const newEnd = addMonths(baseDate, months);

    const updated = await prisma.user.update({
      where: { id: member.id },
      data: {
        subscriptionEnd: newEnd,
        transactions: {
          create: {
            planName: `Renouvellement ${months} mois`,
            amount: Number(amountPaid) || 0,
            durationMonths: months,
            processedBy: `${session.role} #${session.userId}`,
          },
        },
      },
    });

    return NextResponse.json({ member: updated });
  } catch (error) {
    console.error("Erreur renouvellement:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}