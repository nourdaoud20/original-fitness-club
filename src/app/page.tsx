import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import Logo from "@/components/Logo";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();

  // Requêtes réelles vers SQLite (dev.db)
  const [activities, pricingPlans, sessions, activeAlert, coachesCount] = await Promise.all([
    prisma.activity.findMany({ orderBy: { id: "asc" } }),
    prisma.pricingPlan.findMany({ orderBy: { id: "asc" } }),
    prisma.session.findMany({
      where: { status: "SCHEDULED" },
      orderBy: { startTime: "asc" },
      include: {
        coach: { select: { name: true } },
        reservations: { where: { status: "CONFIRMED" } },
      },
    }),
    prisma.alert.findFirst({ where: { isActive: true }, orderBy: { updatedAt: "desc" } }),
    prisma.user.count({ where: { role: "COACH" } }),
  ]);

  const dashboardHref =
    session?.role === "ADMIN"
      ? "/admin"
      : session?.role === "COACH"
      ? "/coach"
      : session?.role === "RECEPTIONIST"
      ? "/reception"
      : "/dashboard";

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Bannière d'alerte réelle depuis la table Alert */}
      {activeAlert && (
        <div className="bg-[#D4AF37] px-4 py-2 text-center text-xs font-bold text-black">
          ⚠️ {activeAlert.message}
        </div>
      )}

      {/* Header Navigation */}
      <header className="sticky top-0 z-50 border-b border-neutral-800 bg-[#121212]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo size="md" />
          <div className="flex items-center gap-3">
            {session ? (
              <Link
                href={dashboardHref}
                className="rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-bold text-black hover:bg-[#e5c158]"
              >
                Mon Espace
              </Link>
            ) : (
              <>
                <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-semibold text-neutral-300 hover:text-white">
                  Se connecter
                </Link>
                <Link href="/register" className="rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-bold text-black hover:bg-[#e5c158]">
                  S&apos;inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-20 px-6 py-14">
        {/* Hero & Infos Pratiques */}
        <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <span className="inline-block rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#D4AF37]">
              Complexe Sportif · Dar-Chaabane
            </span>
            <h1 className="text-4xl font-black leading-tight sm:text-5xl">
              Fit Yourself and Love <span className="text-[#D4AF37]">Your Body.</span>
            </h1>
            <p className="text-neutral-400">
              Plateau musculation &amp; cardio et cours collectifs à jauge limitée encadrés par{" "}
              <span className="font-semibold text-white">{coachesCount} coach(s)</span> certifiés.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href={session ? dashboardHref : "/login"}
                className="rounded-lg bg-[#D4AF37] px-6 py-3 font-bold text-black hover:bg-[#e5c158]"
              >
                {session ? "Accéder à mon tableau de bord" : "Accéder à mon espace"}
              </Link>
              <a href="#planning" className="rounded-lg border border-neutral-700 px-6 py-3 font-semibold hover:border-[#D4AF37]">
                Voir le planning ({sessions.length})
              </a>
            </div>
          </div>

          {/* Localisation & Horaires du Club */}
          <div className="space-y-4 rounded-2xl border border-neutral-800 bg-[#1A1A1A] p-6">
            <div className="rounded-xl border border-neutral-800 bg-[#121212] p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">Localisation</p>
              <p className="mt-1 font-medium">24 Avenue de la paix, Dar-Chaabane, Tunisia</p>
            </div>
            <div className="rounded-xl border border-neutral-800 bg-[#121212] p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">Horaires d&apos;ouverture</p>
              <ul className="mt-2 space-y-1 text-sm text-neutral-300">
                <li>Lundi – Vendredi : <span className="font-semibold text-white">06h00 – 00h00</span></li>
                <li>Samedi : <span className="font-semibold text-white">08h00 – 19h00</span></li>
                <li>Dimanche : <span className="font-semibold text-white">08h00 – 14h00</span></li>
              </ul>
            </div>
          </div>
        </section>

        {/* Catalogue des Activités (Table Activity) */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">Nos Disciplines</h2>
          {activities.length === 0 ? (
            <p className="rounded-xl border border-neutral-800 bg-[#1A1A1A] p-6 text-sm text-neutral-400">
              Aucune discipline enregistrée dans la base de données pour le moment.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {activities.map((act) => (
                <div key={act.id} className="rounded-xl border border-neutral-800 bg-[#1A1A1A] p-5">
                  <h3 className="font-bold text-[#D4AF37]">{act.title}</h3>
                  <p className="mt-2 text-sm text-neutral-400">{act.description}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Planning des Cours Collectifs (Table Session + User + Reservation) */}
        <section id="planning" className="space-y-6">
          <h2 className="text-2xl font-bold">Planning des Cours Collectifs</h2>
          {sessions.length === 0 ? (
            <p className="rounded-xl border border-neutral-800 bg-[#1A1A1A] p-6 text-sm text-neutral-400">
              Aucune séance programmée dans la base de données pour le moment.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sessions.map((s) => (
                <div key={s.id} className="rounded-xl border border-neutral-800 bg-[#1A1A1A] p-5">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <span className="text-xs font-black uppercase text-[#D4AF37]">
                      {s.dayOfWeek ??
                        new Date(s.startTime).toLocaleDateString("fr-FR", { weekday: "long" })}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {new Date(s.startTime).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-bold">{s.title}</h3>
                  <p className="text-sm text-neutral-400">Coach {s.coach.name}</p>
                  <p className="mt-3 text-xs font-semibold text-neutral-300">
                    Inscrits : {s.reservations.length} / {s.capacity}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Grille Tarifaire (Table PricingPlan) */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">Tarifs &amp; Abonnements</h2>
          {pricingPlans.length === 0 ? (
            <p className="rounded-xl border border-neutral-800 bg-[#1A1A1A] p-6 text-sm text-neutral-400">
              Aucune formule tarifaire enregistrée dans la base de données pour le moment.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {pricingPlans.map((t) => (
                <div
                  key={t.id}
                  className={`rounded-2xl border p-6 ${
                    t.popular ? "border-[#D4AF37] bg-[#1E1C14]" : "border-neutral-800 bg-[#1A1A1A]"
                  }`}
                >
                  <p className="text-sm font-bold uppercase text-[#D4AF37]">{t.name}</p>
                  <p className="mt-2 text-3xl font-black">{t.price}</p>
                  <p className="mt-3 text-sm text-neutral-400">{t.description}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}