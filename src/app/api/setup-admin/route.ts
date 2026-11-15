import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Supprimer les anciens tarifs saisis manuellement
    await prisma.pricingPlan.deleteMany();

    // 2. Initialiser les horaires d'ouverture par défaut si vide
    const countHours = await prisma.openingHour.count();
    if (countHours === 0) {
      await prisma.openingHour.createMany({
        data: [
          { days: "Lundi – Vendredi", hours: "06h00 – 00h00", order: 1 },
          { days: "Samedi", hours: "08h00 – 19h00", order: 2 },
          { days: "Dimanche", hours: "08h00 – 14h00", order: 3 },
        ],
      });
    }

    // 3. Garder l'Admin prêt
    const hashedPassword = await bcrypt.hash("Admin1234!", 10);
    await prisma.user.upsert({
      where: { email: "admin@originalfit.tn" },
      update: { role: "ADMIN", password: hashedPassword },
      create: {
        name: "Administrateur",
        email: "admin@originalfit.tn",
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Anciens tarifs supprimés et horaires initialisés !",
    });
  } catch (error) {
    console.error("Erreur setup:", error);
    return NextResponse.json({ success: false, error: "Erreur nettoyage" }, { status: 500 });
  }
}