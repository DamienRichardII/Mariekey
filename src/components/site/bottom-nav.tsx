"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Image as ImageIcon, Phone, Sparkles } from "lucide-react";
import { BOTTOM_NAV } from "@/config/site";
import { cn } from "@/lib/utils";

const ICONS = { home: House, sparkles: Sparkles, image: ImageIcon, phone: Phone };

/** Navigation basse mobile (Accueil, Prestations, Galerie, Contact) avec zone de sécurité iPhone. */
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Navigation mobile" className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur-md lg:hidden">
      <ul className="mx-auto grid max-w-lg grid-cols-4">
        {BOTTOM_NAV.map((i) => {
          const Icon = ICONS[i.icon];
          const active = i.href === "/" ? pathname === "/" : pathname.startsWith(i.href);
          return (
            <li key={i.href}>
              <Link href={i.href} aria-current={active ? "page" : undefined}
                className={cn("flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] tracking-wide", active ? "text-ink" : "text-stone")}>
                <Icon size={21} strokeWidth={active ? 2 : 1.6} aria-hidden />
                {i.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
