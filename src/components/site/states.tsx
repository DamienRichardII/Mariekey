import { cn } from "@/lib/utils";

export function EmptyState({ title, children, className }: { title: string; children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-line bg-cream px-6 py-12 text-center", className)}>
      <p className="font-serif text-2xl">{title}</p>
      {children && <div className="mx-auto mt-2 max-w-md text-[15px] text-stone">{children}</div>}
    </div>
  );
}

export function ErrorState({ reason }: { reason: "not_configured" | "error" }) {
  return (
    <div role="alert" className="rounded-2xl border border-line bg-cream px-6 py-12 text-center">
      <p className="font-serif text-2xl">Contenu momentanément indisponible</p>
      <p className="mx-auto mt-2 max-w-md text-[15px] text-stone">
        Merci de réessayer dans quelques instants.
        {reason === "not_configured" && process.env.NODE_ENV !== "production" && (
          <span className="mt-3 block text-xs">Développement : la base Supabase n&apos;est pas configurée (voir README, variables NEXT_PUBLIC_SUPABASE_*).</span>
        )}
      </p>
    </div>
  );
}

export function SectionTitle({ eyebrow, children, className }: { eyebrow?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      {eyebrow && <p className="mb-3 text-xs font-medium uppercase tracking-[0.28em] text-walnut">{eyebrow}</p>}
      <h2 className="font-serif text-4xl leading-tight sm:text-5xl">{children}</h2>
      <span className="mt-5 block h-px w-14 bg-walnut/60" aria-hidden />
    </div>
  );
}
