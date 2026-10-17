import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import { fetchAppointments } from "@/lib/acuity";
import { MONTHS, type Appointment, groupByDay, longDay, monthGrid, monthParam, monthRange, parseMonth, shiftMonth } from "@/lib/admin/calendar";
import { todayParis } from "@/lib/admin/today";
import { AcuityNotice, AppointmentRow } from "../_appointments";
import { Card, PageHead } from "../_ui";

export const metadata = { title: "Calendrier" };

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ m?: string; d?: string }> }) {
  await requireAdmin();
  const { m, d } = await searchParams;
  const today = todayParis();
  const { year, month } = parseMonth(m, new Date(`${today}T12:00:00Z`));
  const { min, max } = monthRange(year, month);
  const prev = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);
  const res = await fetchAppointments(min, max);

  const byDay: Map<string, Appointment[]> = res.ok ? groupByDay(res.data) : new Map();
  const inMonth = (iso: string) => iso.startsWith(monthParam(year, month));
  const selected = d && inMonth(d) ? d : inMonth(today) ? today : min;
  const list = byDay.get(selected) ?? [];
  const live = (iso: string) => (byDay.get(iso) ?? []).filter((a) => !a.canceled).length;

  return (
    <>
      <PageHead title="Calendrier" hint="Vos rendez-vous Acuity, en lecture seule. Pour ajouter, déplacer ou annuler un rendez-vous, utilisez Acuity." action={
        <a href="https://app.acuityscheduling.com/" target="_blank" rel="noopener noreferrer" className="text-sm text-walnut underline underline-offset-4">Ouvrir Acuity ↗</a>
      } />

      <div className="mb-5 flex items-center justify-between gap-3">
        <Link href={`/admin/calendrier?m=${monthParam(prev.year, prev.month)}`} className="rounded-full border border-line bg-white px-4 py-2 text-sm hover:bg-cream" aria-label="Mois précédent">←</Link>
        <h2 className="font-serif text-2xl capitalize">{MONTHS[month - 1]} {year}</h2>
        <div className="flex gap-2">
          <Link href="/admin/calendrier" className="rounded-full border border-line bg-white px-4 py-2 text-sm hover:bg-cream">Aujourd&apos;hui</Link>
          <Link href={`/admin/calendrier?m=${monthParam(next.year, next.month)}`} className="rounded-full border border-line bg-white px-4 py-2 text-sm hover:bg-cream" aria-label="Mois suivant">→</Link>
        </div>
      </div>

      {!res.ok ? <AcuityNotice reason={res.reason} message={res.message} /> : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <Card>
            <table className="w-full table-fixed border-collapse text-center" aria-label={`Calendrier de ${MONTHS[month - 1]} ${year}`}>
              <thead><tr>{WEEKDAYS.map((w) => <th key={w} scope="col" className="pb-2 text-xs font-medium uppercase tracking-wide text-stone">{w}</th>)}</tr></thead>
              <tbody>
                {monthGrid(year, month).map((week, i) => (
                  <tr key={i}>
                    {week.map((iso, j) => {
                      if (!iso) return <td key={j} />;
                      const n = live(iso);
                      const sel = iso === selected;
                      return (
                        <td key={iso} className="p-0.5">
                          <Link href={`/admin/calendrier?m=${monthParam(year, month)}&d=${iso}`} aria-current={sel ? "date" : undefined}
                            aria-label={`${longDay(iso)} : ${n} rendez-vous`}
                            className={`flex aspect-square flex-col items-center justify-center rounded-xl text-[15px] ${sel ? "bg-ink text-white" : iso === today ? "bg-beige text-ink" : "text-ink hover:bg-cream"}`}>
                            <span>{Number(iso.slice(8))}</span>
                            {n > 0 && <span className={`mt-0.5 rounded-full px-1.5 text-[11px] leading-4 ${sel ? "bg-white/25" : "bg-walnut text-white"}`}>{n}</span>}
                          </Link>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <section aria-labelledby="day-title">
            <h2 id="day-title" className="mb-3 font-serif text-2xl capitalize">{longDay(selected)}</h2>
            {list.length === 0 ? <Card><p className="text-sm text-stone">Aucun rendez-vous ce jour-là.</p></Card> : <ul className="space-y-3">{list.map((a) => <AppointmentRow key={a.id} a={a} />)}</ul>}
          </section>
        </div>
      )}
    </>
  );
}
