import { siInstagram, siSnapchat, siTiktok } from "simple-icons";
import type { SalonSettings } from "@/lib/db-types";
import { cn } from "@/lib/utils";

const NETWORKS = [
  { key: "tiktok", label: "TikTok", path: siTiktok.path },
  { key: "snapchat", label: "Snapchat", path: siSnapchat.path },
  { key: "instagram", label: "Instagram", path: siInstagram.path },
] as const;

/** Liens issus de la configuration uniquement : aucun lien fictif, aucun bouton sans action. */
export function SocialIcons({ social, className, size = 20 }: { social: SalonSettings["social"] | null; className?: string; size?: number }) {
  const items = NETWORKS.filter((n) => social?.[n.key]);
  if (items.length === 0) return null;
  return (
    <ul className={cn("flex items-center gap-1", className)}>
      {items.map((n) => (
        <li key={n.key}>
          <a href={social![n.key]!} target="_blank" rel="noopener noreferrer" aria-label={`${n.label} (nouvel onglet)`}
            className="grid size-11 place-items-center rounded-full text-ink transition-colors hover:bg-cream">
            <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden><path d={n.path} /></svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
