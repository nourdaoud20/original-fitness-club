import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import Logo from "@/components/Logo";
import LogoutButton from "@/components/LogoutButton";
import AdminDashboardClient from "@/components/AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const [coaches, sessions, members, activeSubscriptions, pricingPlans, openingHours] =
    await Promise.all([
      prisma.user.findMany({ where: { role: "COACH" }, select: { id: true, name: true, email: true } }),
      prisma.session.findMany({
        orderBy: { startTime: "asc" },
        include: { coach: { select: { name: true } } },
      }),
      prisma.user.findMany({
        where: { role: "MEMBER" },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          matricule: true,
          subscriptionEnd: true,
        },
      }),
      prisma.user.count({ where: { role: "MEMBER", subscriptionEnd: { gt: new Date() } } }),
      prisma.pricingPlan.findMany({ orderBy: { id: "asc" } }),
      prisma.openingHour.findMany({ orderBy: { order: "asc" } }),
    ]);

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <header className="border-b border-neutral-800 bg-[#1A1A1A] px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <span className="rounded bg-[#D4AF37]/20 px-2.5 py-1 text-xs font-bold text-[#D4AF37]">
              ADMINISTRATION
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-neutral-300 hover:text-[#D4AF37]">
              Voir le site public
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-neutral-800 bg-[#1A1A1A] p-5">
            <p className="text-xs text-neutral-400">Coachs</p>
            <p className="mt-1 text-2xl font-black text-[#D4AF37]">{coaches.length}</p>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-[#1A1A1A] p-5">
            <p className="text-xs text-neutral-400">Cours Programmés</p>
            <p className="mt-1 text-2xl font-black text-white">{sessions.length}</p>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-[#1A1A1A] p-5">
            <p className="text-xs text-neutral-400">Adhérents Inscrits</p>
            <p className="mt-1 text-2xl font-black text-white">{members.length}</p>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-[#1A1A1A] p-5">
            <p className="text-xs text-neutral-400">Abonnements Actifs</p>
            <p className="mt-1 text-2xl font-black text-emerald-400">{activeSubscriptions}</p>
          </div>
        </div>

        <AdminDashboardClient
          coaches={coaches}
          sessions={sessions.map((s) => ({
            ...s,
            startTime: s.startTime.toISOString(),
            endTime: s.endTime.toISOString(),
          }))}
          members={members.map((m) => ({
            ...m,
            subscriptionEnd: m.subscriptionEnd ? m.subscriptionEnd.toISOString() : null,
          }))}
          pricingPlans={pricingPlans}
          openingHours={openingHours}
        />
      </main>
    </div>
  );
}