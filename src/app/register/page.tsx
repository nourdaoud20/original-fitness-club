import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import Logo from "@/components/Logo";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#121212] px-4 text-white">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-neutral-800 bg-[#1A1A1A] p-8">
        <div className="flex flex-col items-center text-center">
          <Logo size="lg" />
          <p className="mt-3 text-sm text-neutral-400">Créer un compte visiteur / adhérent</p>
        </div>

        <AuthForm mode="register" />

        <div className="flex justify-between text-xs text-neutral-400">
          <Link href="/" className="hover:text-white">← Retour à l&apos;accueil</Link>
          <Link href="/login" className="text-[#D4AF37] hover:underline">Déjà inscrit ? Se connecter</Link>
        </div>
      </div>
    </main>
  );
}