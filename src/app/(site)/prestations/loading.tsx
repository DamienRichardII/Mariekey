import { ServiceCardSkeleton } from "@/components/site/service-card";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8" role="status" aria-label="Chargement des prestations">
      <div className="h-10 w-64 animate-pulse rounded bg-beige" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <ServiceCardSkeleton key={i} />)}</div>
    </div>
  );
}
