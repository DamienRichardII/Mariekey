import { Button } from "@/components/ui/button";

export function Notice({ ok, err }: { ok?: string; err?: string }) {
  if (!ok && !err) return null;
  return (
    <p role={err ? "alert" : "status"} className={`mb-6 rounded-xl border px-4 py-3 text-sm ${err ? "border-danger/40 bg-danger/5 text-danger" : "border-ok/40 bg-ok/5 text-ok"}`}>
      {err ?? ok}
    </p>
  );
}

export function PageHead({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-serif text-3xl text-ink">{title}</h1>
        {hint && <p className="mt-1 max-w-2xl text-sm text-stone">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-line bg-white p-5 shadow-soft sm:p-6 ${className}`}>
      {title && <h2 className="mb-4 text-lg font-medium text-ink">{title}</h2>}
      {children}
    </section>
  );
}

export function Check({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px] text-ink">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-5 accent-walnut" />
      {label}
    </label>
  );
}

export function Save({ children = "Enregistrer" }: { children?: React.ReactNode }) {
  return <Button type="submit">{children}</Button>;
}
