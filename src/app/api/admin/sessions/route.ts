import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { title, dayOfWeek, startTime, endTime, capacity, coachId } = await req.json();
  if (!title || !dayOfWeek || !startTime || !endTime || !capacity || !coachId) {
    return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 });
  }

  const newSession = await prisma.session.create({
    data: {
      title,
      dayOfWeek,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      capacity: Number(capacity),
      coachId: Number(coachId),
      status: "SCHEDULED",
    },
  });

  return NextResponse.json({ session: newSession }, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  await prisma.reservation.deleteMany({ where: { sessionId: id } });
  await prisma.session.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}