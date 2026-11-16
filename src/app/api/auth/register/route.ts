import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "L'inscription en ligne est fermée. Votre compte est créé directement à l'accueil du club lors de votre paiement.",
    },
    { status: 403 }
  );
}