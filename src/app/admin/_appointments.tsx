import { Phone, Mail } from "lucide-react";
import { timeOf, type Appointment } from "@/lib/admin/calendar";

/** Fiche d'un rendez-vous Acuity (lecture seule : la modification se fait dans Acuity). */
export function AppointmentRow({ a }: { a: Appointment }) {
  return (
    <li className={`rounded-xl border border-line bg-white p-4 ${a.canceled ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-serif text-xl text-ink">{timeOf(a)}{a.end ? ` – ${a.end}` : ""}</span>
        <span className={`font-medium ${a.canceled ? "line-through" : ""}`}>{a.client}</span>
        {a.canceled && <span className="rounded-full bg-danger/10 px-2.5 py-0.5 text-xs text-danger">Annulé</span>}
        {!a.canceled && a.paid && <span className="rounded-full bg-ok/10 px-2.5 py-0.5 text-xs text-ok">Payé</span>}
      </div>
      <p className="mt-1 text-sm text-ink-soft">{a.service}{a.duration ? ` · ${a.duration} min` : ""}{a.price ? ` · ${a.price}` : ""}</p>
      <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {a.phone && <a href={`tel:${a.phone.replace(/\s/g, "")}`} className="inline-flex min-h-8 items-center gap-1.5 text-walnut hover:underline"><Phone size={14} aria-hidden />{a.phone}</a>}
        {a.email && <a href={`mailto:${a.email}`} className="inline-flex min-h-8 items-center gap-1.5 break-all text-walnut hover:underline"><Mail size={14} aria-hidden />{a.email}</a>}
      </p>
      {a.notes && <p className="mt-2 whitespace-pre-line rounded-lg bg-cream px-3 py-2 text-sm text-ink-soft">{a.notes}</p>}
    </li>
  );
}

export function AcuityNotice({ reason, message }: { reason: "not-configured" | "auth" | "error"; message: string }) {
  return (
    <div role="alert" className="rounded-xl border border-line bg-white p-5 text-sm text-ink-soft">
      <p className="font-medium text-ink">{message}</p>
      {reason === "not-configured" ? (
        <p className="mt-2">
          Pour afficher vos rendez-vous ici, ajoutez les variables <code className="rounded bg-cream px-1.5 py-0.5">ACUITY_USER_ID</code> et{" "}
          <code className="rounded bg-cream px-1.5 py-0.5">ACUITY_API_KEY</code> dans Vercel (Settings, Environment Variables), puis redéployez.
          Les deux valeurs se trouvent dans Acuity, rubrique Integrations, puis API. Voir <code className="rounded bg-cream px-1.5 py-0.5">docs/ADMIN.md</code>.
        </p>
      ) : (
        <p className="mt-2">Vérifiez l&apos;identifiant et la clé API dans Vercel, ou réessayez dans un instant.</p>
      )}
      <a href="https://app.acuityscheduling.com/" target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-walnut underline underline-offset-4">Ouvrir mon agenda Acuity ↗</a>
    </div>
  );
}
