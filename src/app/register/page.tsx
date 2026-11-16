import Link from "next/link";
import Logo from "@/components/Logo";

export default function RegisterInfoPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#121212] px-4 text-white">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-neutral-800 bg-[#1A1A1A] p-8 text-center">
        <div className="flex justify-center">
          <Logo size="md" />
        </div>
        <h1 className="text-2xl font-black text-[#D4AF37]">Inscription au Club</h1>
        <p className="text-sm leading-relaxed text-neutral-300">
          Pour garantir un accès réservé aux membres d&apos;<strong>Original Fitness Club</strong>,
          votre compte est créé directement à l&apos;accueil lors du règlement de votre abonnement.
        </p>
        <div className="rounded-xl border border-neutral-800 bg-[#121212] p-4 text-xs text-neutral-400">
          📍 24 Avenue de la paix, Dar-Chaabane · Munissez-vous de vos identifiants remis à la réception.
        </div>
        <div className="flex flex-col gap-3 pt-2">
          <Link
            href="/login"
            className="w-full rounded-lg bg-[#D4AF37] py-3 text-sm font-bold text-black hover:bg-[#e5c158]"
          >
            J&apos;ai déjà mes identifiants · Se connecter
          </Link>
          <Link
            href="/#tarifs"
            className="w-full rounded-lg border border-neutral-700 py-2.5 text-sm font-semibold text-neutral-300 hover:border-[#D4AF37]"
          >
            Consulter nos tarifs
          </Link>
        </div>
      </div>
    </div>
  );
}