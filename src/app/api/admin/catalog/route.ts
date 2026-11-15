import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();

  if (body.type === "ACTIVITY") {
    const item = await prisma.activity.create({
      data: { title: body.title, description: body.description },
    });
    return NextResponse.json({ item }, { status: 201 });
  }

  if (body.type === "PRICING") {
    const item = await prisma.pricingPlan.create({
      data: {
        name: body.name,
        price: body.price,
        description: body.description,
        popular: Boolean(body.popular),
      },
    });
    return NextResponse.json({ item }, { status: 201 });
  }

  if (body.type === "HOURS") {
    const item = await prisma.openingHour.create({
      data: {
        days: body.days,
        hours: body.hours,
        order: Number(body.order ?? 0),
      },
    });
    return NextResponse.json({ item }, { status: 201 });
  }

  if (body.type === "ALERT") {
    await prisma.alert.updateMany({ data: { isActive: false } });
    const item = await prisma.alert.create({
      data: { message: body.message, isActive: true },
    });
    return NextResponse.json({ item }, { status: 201 });
  }

  return NextResponse.json({ error: "Type invalide" }, { status: 400 });
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  if (body.type === "HOURS") {
    const updated = await prisma.openingHour.update({
      where: { id: Number(body.id) },
      data: { days: body.days, hours: body.hours },
    });
    return NextResponse.json({ updated });
  }

  return NextResponse.json({ error: "Type invalide" }, { status: 400 });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const id = Number(searchParams.get("id"));

  if (type === "PRICING") {
    await prisma.pricingPlan.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  }

  if (type === "HOURS") {
    await prisma.openingHour.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
}