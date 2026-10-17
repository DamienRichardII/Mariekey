import { CalendarCheck, Clock, MapPin, MessageCircle } from "lucide-react";

const ITEMS = [
  { icon: CalendarCheck, label: "Réservation en ligne" },
  { icon: Clock, label: "Uniquement sur rendez-vous" },
  { icon: MapPin, label: "Gentilly (94)" },
  { icon: MessageCircle, label: "Devis mariage & événements" },
] as const;

export function Reassurance() {
  return (
    <section aria-label="Nos engagements" className="border-y border-line bg-cream">
      <ul className="mx-auto grid max-w-5xl grid-cols-2 gap-y-8 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:py-12">
        {ITEMS.map(({ icon: Icon, label }) => (
          <li key={label} className="flex flex-col items-center gap-3 text-center">
            <Icon size={28} strokeWidth={1.3} className="text-walnut" aria-hidden />
            <span className="text-[15px]">{label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
