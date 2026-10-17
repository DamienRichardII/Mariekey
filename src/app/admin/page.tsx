import Link from "next/link";
import { CalendarDays, FileText, ListChecks, MessageSquareQuote, Pencil, Settings } from "lucide-react";
import { fetchAppointments, acuityConfigured } from "@/lib/acuity";
import { groupByDay, longDay, weekOf } from "@/lib/admin/calendar";
import { adminConfigured, requireAdmin } from "@/lib/admin/session";
import { todayParis } from "@/lib/admin/today";
import { createAdminClient } from "@/lib/supabase/admin";
import { AcuityNotice, AppointmentRow } from "./_appointments";
import { Card, Notice, PageHead } from "./_ui";

export const metadata = { title: "Tableau de bord" };

const SHORTCUTS = [
  { href: "/admin/calendrier", label: "Calendrier des rendez-vous", icon: CalendarDays },
  { href: "/admin/prestations", label: "Prestations et prix", icon: ListChecks },
  { href: "/admin/textes", label: "Textes des pages", icon: Pencil },
  { href: "/admin/articles/nouveau", label: "Écrire un article", icon: FileText },
  { href: "/admin/avis", label: "Avis clients", icon: MessageSquareQuote },
  { href: "/admin/salon", label: "Infos du salon", icon: Settings },
] as const;

async function count(db: NonNullable<ReturnType<typeof createAdminClient>>, table: string, filter?: [string, boolean]) {
  let q = db.from(table).select("id", { count: "exact", head: true });
  if (filter) q = q.eq(filter[0], filter[1]);
  const { count: n } = await q;
  return n ?? 0;
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  await requireAdmin();
  const { ok, err } = await searchParams;
  const today = todayParis();
  const week = weekOf(today);
  const db = createAdminClient();
  const [appts, services, articles, reviews] = await Promise.all([
    fetchAppointments(week[0], week[6]),
    db ? count(db, "services", ["is_active", true]) : 0,
    db ? count(db, "articles", ["is_published", true]) : 0,
    db ? count(db, "reviews", ["is_active", true]) : 0,
  ]);

  const byDay = appts.ok ? groupByDay(appts.data) : null;
  const live = (iso: string) => (byDay?.get(iso) ?? []).filter((a) => !a.canceled);
  const todayList = byDay?.get(today) ?? [];
  const weekCount = week.reduce((n, iso) => n + live(iso).length, 0);
  const upcoming = week.filter((iso) => iso > today && live(iso).length > 0);

  const warnings: string[] = [];
  if (process.env.ADMIN_OPEN?.trim() === "true") warnings.push("L'administration est ouverte sans mot de passe (ADMIN_OPEN=true). Retirez cette variable dans Vercel dès que ADMIN_PASSWORD est défini.");
  if (!adminConfigured() && process.env.ADMIN_OPEN?.trim() !== "true") warnings.push("ADMIN_PASSWORD n'est pas défini : personne ne peut se connecter.");
  if (!db) warnings.push("La base de données n'est pas connectée (NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY manquants) : les modifications ne seront pas enregistrées.");
  if (!acuityConfigured()) warnings.push("Acuity n'est pas relié : le calendrier restera vide tant que ACUITY_USER_ID et ACUITY_API_KEY ne sont pas définis.");

  const stats = [
    { label: "Rendez-vous aujourd'hui", value: appts.ok ? live(today).length : "—" },
    { label: "Rendez-vous cette semaine", value: appts.ok ? weekCount : "—" },
    { label: "Prestations affichées", value: services },
    { label: "Articles publiés", value: articles },
    { label: "Avis visibles", value: reviews },
  ];

  return (
    <>
      <PageHead title="Tableau de bord" hint={`Bonjour Marie. Nous sommes le ${longDay(today)}.`} />
      <Notice ok={ok} err={err} />
      {warnings.length > 0 && (
        <ul role="alert" className="mb-6 space-y-2 rounded-xl border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger">
          {warnings.map((w) => <li key={w}>{w}</li>)}
        </ul>
      )}

      <dl className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-white p-4">
            <dd className="font-serif text-4xl text-ink">{s.value}</dd>
            <dt className="mt-1 text-xs uppercase tracking-wide text-stone">{s.label}</dt>
          </div>
        ))}
      </dl>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section aria-labelledby="today-title">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 id="today-title" className="font-serif text-2xl">Aujourd&apos;hui</h2>
            <Link href="/admin/calendrier" className="text-sm text-walnut underline underline-offset-4">Voir le calendrier</Link>
          </div>
          {!appts.ok ? <AcuityNotice reason={appts.reason} message={appts.message} /> : todayList.length === 0 ? (
            <Card><p className="text-sm text-stone">Aucun rendez-vous aujourd&apos;hui.</p></Card>
          ) : <ul className="space-y-3">{todayList.map((a) => <AppointmentRow key={a.id} a={a} />)}</ul>}

          {appts.ok && upcoming.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 font-serif text-2xl">À venir cette semaine</h2>
              <div className="space-y-5">
                {upcoming.map((iso) => (
                  <div key={iso}>
                    <h3 className="mb-2 text-sm font-medium capitalize text-ink-soft">{longDay(iso)}</h3>
                    <ul className="space-y-3">{live(iso).map((a) => <AppointmentRow key={a.id} a={a} />)}</ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section aria-labelledby="short-title">
          <h2 id="short-title" className="mb-3 font-serif text-2xl">Raccourcis</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {SHORTCUTS.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link href={href} className="flex min-h-14 items-center gap-3 rounded-2xl border border-line bg-white px-4 text-[15px] hover:bg-cream">
                  <Icon size={20} className="text-walnut" aria-hidden /> {label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
