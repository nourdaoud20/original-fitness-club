"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const data = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Une erreur est survenue");
      return;
    }

    const user = await res.json();

    // Redirection intelligente selon le rôle (TP2 + Cahier des Charges)
    if (user.role === "ADMIN") router.push("/admin");
    else if (user.role === "COACH") router.push("/coach");
    else if (user.role === "RECEPTIONIST") router.push("/reception");
    else router.push("/dashboard");

    router.refresh();
  }

  const inputCls =
    "w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-white placeholder-neutral-500 focus:border-[#D4AF37] focus:outline-none";

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-4">
      {mode === "register" && (
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-neutral-400">
            Nom complet
          </label>
          <input name="name" placeholder="Ex: Yassine Benali" required className={inputCls} />
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs uppercase tracking-wider text-neutral-400">
          Email
        </label>
        <input name="email" type="email" placeholder="vous@exemple.com" required className={inputCls} />
      </div>

      <div>
        <label className="mb-1 block text-xs uppercase tracking-wider text-neutral-400">
          Mot de passe
        </label>
        <input name="password" type="password" placeholder="••••••••" required className={inputCls} />
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        disabled={loading}
        className="mt-2 w-full rounded-lg bg-[#D4AF37] py-3 font-bold text-black transition hover:bg-[#e5c158] disabled:opacity-50"
      >
        {loading ? "Patientez..." : mode === "login" ? "Se connecter" : "Créer mon compte"}
      </button>
    </form>
  );
}