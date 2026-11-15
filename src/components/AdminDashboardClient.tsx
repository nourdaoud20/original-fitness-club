"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Coach = { id: number; name: string; email: string };
type SessionItem = {
  id: number;
  title: string;
  dayOfWeek: string | null;
  startTime: string;
  endTime: string;
  capacity: number;
  coach: { name: string };
};
type PricingItem = {
  id: number;
  name: string;
  price: string;
  description: string;
  popular: boolean;
};
type HourItem = {
  id: number;
  days: string;
  hours: string;
};

export default function AdminDashboardClient({
  coaches,
  sessions,
  pricingPlans,
  openingHours,
}: {
  coaches: Coach[];
  sessions: SessionItem[];
  pricingPlans: PricingItem[];
  openingHours: HourItem[];
}) {
  const router = useRouter();
  const [msg, setMsg] = useState("");

  // Form Coach
  const [coachName, setCoachName] = useState("");
  const [coachEmail, setCoachEmail] = useState("");
  const [coachPassword, setCoachPassword] = useState("Coach1234!");

  // Form Séance
  const [title, setTitle] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("Lundi");
  const [startTime, setStartTime] = useState("2026-11-16T18:30");
  const [endTime, setEndTime] = useState("2026-11-16T19:30");
  const [capacity, setCapacity] = useState(20);
  const [coachId, setCoachId] = useState<number>(coaches[0]?.id ?? 0);

  // Form Tarifs (PricingPlan)
  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState("");
  const [planDesc, setPlanDesc] = useState("");
  const [planPopular, setPlanPopular] = useState(false);

  // Form Horaires d'ouverture
  const [newDays, setNewDays] = useState("");
  const [newHours, setNewHours] = useState("");
  const [editingHours, setEditingHours] = useState<Record<number, string>>({});

  // Form Activité & Alerte
  const [actTitle, setActTitle] = useState("");
  const [actDesc, setActDesc] = useState("");
  const [alertMsg, setAlertMsg] = useState("");

  async function handleAddCoach(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/coaches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: coachName, email: coachEmail, password: coachPassword }),
    });
    const data = await res.json();
    if (!res.ok) return setMsg("❌ " + data.error);
    setMsg("✅ Coach ajouté !");
    setCoachName("");
    setCoachEmail("");
    router.refresh();
  }

  async function handleAddSession(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, dayOfWeek, startTime, endTime, capacity, coachId }),
    });
    const data = await res.json();
    if (!res.ok) return setMsg("❌ " + data.error);
    setMsg("✅ Séance ajoutée au planning !");
    setTitle("");
    router.refresh();
  }

  async function handleDeleteSession(id: number) {
    await fetch(`/api/admin/sessions?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function handleAddPricing(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/catalog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "PRICING",
        name: planName,
        price: planPrice,
        description: planDesc,
        popular: planPopular,
      }),
    });
    if (res.ok) {
      setMsg("✅ Tarif ajouté !");
      setPlanName("");
      setPlanPrice("");
      setPlanDesc("");
      setPlanPopular(false);
      router.refresh();
    }
  }

  async function handleDeletePricing(id: number) {
    await fetch(`/api/admin/catalog?type=PRICING&id=${id}`, { method: "DELETE" });
    setMsg("🗑️ Tarif supprimé.");
    router.refresh();
  }

  async function handleAddHour(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/catalog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "HOURS", days: newDays, hours: newHours }),
    });
    if (res.ok) {
      setMsg("✅ Horaire ajouté !");
      setNewDays("");
      setNewHours("");
      router.refresh();
    }
  }

  async function handleUpdateHour(item: HourItem) {
    const updatedValue = editingHours[item.id] ?? item.hours;
    const res = await fetch("/api/admin/catalog", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "HOURS", id: item.id, days: item.days, hours: updatedValue }),
    });
    if (res.ok) {
      setMsg(`✅ Horaire "${item.days}" mis à jour !`);
      router.refresh();
    }
  }

  async function handleDeleteHour(id: number) {
    await fetch(`/api/admin/catalog?type=HOURS&id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function handleAddCatalog(e: React.FormEvent, type: "ACTIVITY" | "ALERT") {
    e.preventDefault();
    const payload =
      type === "ACTIVITY"
        ? { type: "ACTIVITY", title: actTitle, description: actDesc }
        : { type: "ALERT", message: alertMsg };

    const res = await fetch("/api/admin/catalog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setMsg(type === "ACTIVITY" ? "✅ Discipline ajoutée !" : "✅ Alerte publiée sur l'accueil !");
      setActTitle("");
      setActDesc("");
      setAlertMsg("");
      router.refresh();
    }
  }

  return (
    <div className="space-y-10">
      {msg && (
        <div className="rounded-xl border border-[#D4AF37] bg-[#1E1C14] px-4 py-3 text-sm font-semibold text-[#D4AF37]">
          {msg}
        </div>
      )}

      {/* 1. Coachs & Séances */}
      <div className="grid gap-8 lg:grid-cols-2">
        <form onSubmit={handleAddCoach} className="space-y-4 rounded-2xl border border-neutral-800 bg-[#1A1A1A] p-6">
          <h2 className="text-lg font-bold text-[#D4AF37]">1. Ajouter un Coach</h2>
          <input
            type="text"
            placeholder="Nom du coach (ex: Manel)"
            value={coachName}
            onChange={(e) => setCoachName(e.target.value)}
            required
            className="w-full rounded-lg border border-neutral-700 bg-[#121212] px-4 py-2.5 text-sm"
          />
          <input
            type="email"
            placeholder="Email (ex: manel@originalfit.tn)"
            value={coachEmail}
            onChange={(e) => setCoachEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-neutral-700 bg-[#121212] px-4 py-2.5 text-sm"
          />
          <input
            type="text"
            placeholder="Mot de passe"
            value={coachPassword}
            onChange={(e) => setCoachPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-neutral-700 bg-[#121212] px-4 py-2.5 text-sm"
          />
          <button type="submit" className="w-full rounded-lg bg-[#D4AF37] py-2.5 text-sm font-bold text-black hover:bg-[#e5c158]">
            + Enregistrer le Coach
          </button>
          <div className="pt-2 text-xs text-neutral-400">
            Coachs actifs ({coaches.length}) : {coaches.map((c) => `${c.name} (#${c.id})`).join(", ") || "Aucun"}
          </div>
        </form>

        <form onSubmit={handleAddSession} className="space-y-4 rounded-2xl border border-neutral-800 bg-[#1A1A1A] p-6">
          <h2 className="text-lg font-bold text-[#D4AF37]">2. Programmer un Cours Collectif</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Cours (ex: AFRO DANCE)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="rounded-lg border border-neutral-700 bg-[#121212] px-4 py-2.5 text-sm"
            />
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              className="rounded-lg border border-neutral-700 bg-[#121212] px-4 py-2.5 text-sm"
            >
              {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"].map((j) => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs text-neutral-400">Début</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-neutral-700 bg-[#121212] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-400">Fin</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-neutral-700 bg-[#121212] px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={coachId}
              onChange={(e) => setCoachId(Number(e.target.value))}
              required
              className="rounded-lg border border-neutral-700 bg-[#121212] px-4 py-2.5 text-sm"
            >
              <option value={0}>-- Choisir un Coach --</option>
              {coaches.map((c) => (
                <option key={c.id} value={c.id}>Coach {c.name}</option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              placeholder="Capacité (ex: 20)"
              required
              className="rounded-lg border border-neutral-700 bg-[#121212] px-4 py-2.5 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={coaches.length === 0}
            className="w-full rounded-lg bg-[#D4AF37] py-2.5 text-sm font-bold text-black hover:bg-[#e5c158] disabled:opacity-50"
          >
            + Ajouter au Planning
          </button>
        </form>
      </div>

      {/* 2. Tarifs & Horaires d'ouverture (Saisons : Ramadan, Été, Normal) */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gestion Tarifs (PricingPlan) */}
        <div className="space-y-4 rounded-2xl border border-neutral-800 bg-[#1A1A1A] p-6">
          <h2 className="text-lg font-bold text-[#D4AF37]">3. Gérer les Tarifs (Abonnements)</h2>
          <form onSubmit={handleAddPricing} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Formule (ex: Mensuel, Trimestriel, Annuel)"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                required
                className="rounded-lg border border-neutral-700 bg-[#121212] px-4 py-2.5 text-sm"
              />
              <input
                type="text"
                placeholder="Prix (ex: 85 DT / mois)"
                value={planPrice}
                onChange={(e) => setPlanPrice(e.target.value)}
                required
                className="rounded-lg border border-neutral-700 bg-[#121212] px-4 py-2.5 text-sm"
              />
            </div>
            <input
              type="text"
              placeholder="Description (ex: Accès illimité musculation + cours collectifs)"
              value={planDesc}
              onChange={(e) => setPlanDesc(e.target.value)}
              required
              className="w-full rounded-lg border border-neutral-700 bg-[#121212] px-4 py-2.5 text-sm"
            />
            <label className="flex items-center gap-2 text-xs text-neutral-300">
              <input
                type="checkbox"
                checked={planPopular}
                onChange={(e) => setPlanPopular(e.target.checked)}
                className="accent-[#D4AF37]"
              />
              Mettre en avant (Badge &quot;Populaire&quot;)
            </label>
            <button type="submit" className="w-full rounded-lg bg-[#D4AF37] py-2 text-sm font-bold text-black hover:bg-[#e5c158]">
              + Ajouter ce Tarif
            </button>
          </form>

          {/* Liste des tarifs actifs */}
          <div className="space-y-2 pt-2">
            {pricingPlans.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-neutral-800 bg-[#121212] px-4 py-2.5">
                <div>
                  <span className="font-bold text-white">{p.name}</span>{" "}
                  <span className="text-xs font-bold text-[#D4AF37]">({p.price})</span>
                  {p.popular && (
                    <span className="ml-2 rounded bg-[#D4AF37]/20 px-1.5 py-0.5 text-[10px] text-[#D4AF37]">
                      POPULAIRE
                    </span>
                  )}
                  <p className="text-xs text-neutral-400">{p.description}</p>
                </div>
                <button
                  onClick={() => handleDeletePricing(p.id)}
                  className="text-xs text-red-400 hover:underline"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Gestion Horaires d'Ouverture */}
        <div className="space-y-4 rounded-2xl border border-neutral-800 bg-[#1A1A1A] p-6">
          <h2 className="text-lg font-bold text-[#D4AF37]">4. Horaires d&apos;Ouverture (Ramadan / Été / Normal)</h2>
          <p className="text-xs text-neutral-400">
            Modifie directement les plages horaires ci-dessous pour les mettre à jour sur la vitrine.
          </p>

          <div className="space-y-2.5">
            {openingHours.map((h) => (
              <div key={h.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-800 bg-[#121212] p-3">
                <span className="min-w-[130px] text-xs font-bold text-white">{h.days} :</span>
                <input
                  type="text"
                  value={editingHours[h.id] ?? h.hours}
                  onChange={(e) => setEditingHours({ ...editingHours, [h.id]: e.target.value })}
                  className="flex-1 rounded border border-neutral-700 bg-[#1A1A1A] px-3 py-1.5 text-xs text-[#D4AF37]"
                />
                <button
                  onClick={() => handleUpdateHour(h)}
                  className="rounded bg-[#D4AF37] px-3 py-1.5 text-xs font-bold text-black hover:bg-[#e5c158]"
                >
                  Enregistrer
                </button>
                <button
                  onClick={() => handleDeleteHour(h.id)}
                  className="rounded border border-red-900/50 px-2 py-1.5 text-xs text-red-400"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddHour} className="grid gap-2 pt-2 sm:grid-cols-3">
            <input
              type="text"
              placeholder="Jours (ex: Soirées Ramadan)"
              value={newDays}
              onChange={(e) => setNewDays(e.target.value)}
              required
              className="rounded-lg border border-neutral-700 bg-[#121212] px-3 py-2 text-xs"
            />
            <input
              type="text"
              placeholder="Heures (ex: 20h30 – 01h00)"
              value={newHours}
              onChange={(e) => setNewHours(e.target.value)}
              required
              className="rounded-lg border border-neutral-700 bg-[#121212] px-3 py-2 text-xs"
            />
            <button type="submit" className="rounded-lg border border-[#D4AF37] py-2 text-xs font-bold text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black">
              + Ajouter ligne
            </button>
          </form>
        </div>
      </div>

      {/* 3. Planning Actuel */}
      <div className="rounded-2xl border border-neutral-800 bg-[#1A1A1A] p-6">
        <h2 className="mb-4 text-lg font-bold">Planning Actuel ({sessions.length} cours)</h2>
        {sessions.length === 0 ? (
          <p className="text-sm text-neutral-400">Aucun cours programmé.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-xl border border-neutral-800 bg-[#121212] p-4">
                <div>
                  <p className="text-xs font-bold uppercase text-[#D4AF37]">{s.dayOfWeek}</p>
                  <p className="font-bold">{s.title}</p>
                  <p className="text-xs text-neutral-400">Coach {s.coach.name} · {s.capacity} places</p>
                </div>
                <button
                  onClick={() => handleDeleteSession(s.id)}
                  className="rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-1.5 text-xs text-red-400 hover:bg-red-900/60"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Ajouter Discipline & Bannière d'Alerte */}
      <div className="grid gap-8 lg:grid-cols-2">
        <form onSubmit={(e) => handleAddCatalog(e, "ACTIVITY")} className="space-y-4 rounded-2xl border border-neutral-800 bg-[#1A1A1A] p-6">
          <h2 className="text-lg font-bold text-[#D4AF37]">5. Ajouter une Discipline (Vitrine)</h2>
          <input
            type="text"
            placeholder="Titre (ex: AFRO DANCE)"
            value={actTitle}
            onChange={(e) => setActTitle(e.target.value)}
            required
            className="w-full rounded-lg border border-neutral-700 bg-[#121212] px-4 py-2.5 text-sm"
          />
          <input
            type="text"
            placeholder="Description courte"
            value={actDesc}
            onChange={(e) => setActDesc(e.target.value)}
            required
            className="w-full rounded-lg border border-neutral-700 bg-[#121212] px-4 py-2.5 text-sm"
          />
          <button type="submit" className="w-full rounded-lg border border-[#D4AF37] py-2 text-sm font-bold text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black">
            + Publier la Discipline
          </button>
        </form>

        <form onSubmit={(e) => handleAddCatalog(e, "ALERT")} className="space-y-4 rounded-2xl border border-neutral-800 bg-[#1A1A1A] p-6">
          <h2 className="text-lg font-bold text-[#D4AF37]">6. Publier une Alerte Globale</h2>
          <input
            type="text"
            placeholder="Ex: Horaires spéciaux Ramadan dès demain !"
            value={alertMsg}
            onChange={(e) => setAlertMsg(e.target.value)}
            required
            className="w-full rounded-lg border border-neutral-700 bg-[#121212] px-4 py-2.5 text-sm"
          />
          <button type="submit" className="w-full rounded-lg border border-[#D4AF37] py-2 text-sm font-bold text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black">
            Diffuser sur l&apos;accueil
          </button>
        </form>
      </div>
    </div>
  );
}