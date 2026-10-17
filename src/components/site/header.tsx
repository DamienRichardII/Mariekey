import Link from "next/link";
import { NAV } from "@/config/site";
import type { SalonSettings } from "@/lib/db-types";
import { BookButton } from "./book-button";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { SocialIcons } from "./social-icons";

export function Header({ social }: { social: SalonSettings["social"] | null }) {
  return (
    <header className="safe-top fixed inset-x-0 top-0 z-40 border-b border-line/70 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:h-[72px] lg:px-8">
        <Link href="/" aria-label="Mariekey Expert — accueil" className="shrink-0"><Logo size="sm" className="lg:hidden" /><Logo size="md" className="hidden lg:inline-flex" /></Link>
        <nav aria-label="Navigation principale" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((i) => (
              <li key={i.href}>
                <Link href={i.href} className="rounded-full px-4 py-2.5 text-[15px] text-ink-soft transition-colors hover:bg-cream hover:text-ink">{i.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-1 lg:ml-2">
          <SocialIcons social={social} size={19} />
          <BookButton size="sm" className="ml-2 hidden lg:inline-flex" />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
