import Link from "next/link";
import type { Metadata } from "next";
import { isAdmin } from "@/lib/admin/session";
import { logout } from "./actions";

export const metadata: Metadata = { title: { default: "Administration", template: "%s — Administration" }, robots: { index: false, follow: false } };

/** Pages dépendantes de la session : jamais de rendu statique. */
export const dynamic = "force-dynamic";

const LINKS = [
  { href: "/admin", label: "Prestations" },
  { href: "/admin/categories", label: "Catégories" },
  { href: "/admin/photos", label: "Photos" },
  { href: "/admin/salon", label: "Infos du salon" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAdmin();
  return (
    <div className="min-h-dvh bg-cream">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <span className="font-serif text-xl text-ink">Mariekey · Admin</span>
          {authed && (
            <>
              <nav aria-label="Administration" className="flex flex-wrap gap-1">
                {LINKS.map((l) => (
                  <Link key={l.href} href={l.href} className="rounded-full px-4 py-2 text-sm text-ink hover:bg-cream">{l.label}</Link>
                ))}
              </nav>
              <div className="ml-auto flex items-center gap-2">
                <Link href="/" target="_blank" className="rounded-full px-4 py-2 text-sm text-walnut hover:bg-cream">Voir le site ↗</Link>
                <form action={logout}><button className="rounded-full px-4 py-2 text-sm text-stone hover:bg-cream">Déconnexion</button></form>
              </div>
            </>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
