"use client";
import Image from "next/image";
import { useId, useState } from "react";
import { realAsset } from "@/lib/assets";
import type { BeforeAfterPair } from "@/lib/db-types";

/** Comparateur : curseur natif <input type=range> (clavier, lecteurs d'écran) sur une paire correctement identifiée. */
function Comparer({ pair }: { pair: BeforeAfterPair }) {
  const [pos, setPos] = useState(50);
  const id = useId();
  const before = realAsset(pair.before.path);
  const after = realAsset(pair.after.path);
  if (!before || !after) return null;
  return (
    <figure>
      <div className="relative aspect-[3/4] select-none overflow-hidden rounded-2xl bg-beige shadow-soft">
        <Image src={after} alt={pair.after.alt || "Après"} fill sizes="(min-width:1024px) 30vw, 90vw" className="object-cover" />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <Image src={before} alt={pair.before.alt || "Avant"} fill sizes="(min-width:1024px) 30vw, 90vw" className="object-cover" />
        </div>
        <span className="absolute bottom-3 left-3 rounded-full bg-ink/80 px-3.5 py-1.5 text-xs font-medium tracking-wide text-white">Avant</span>
        <span className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-medium tracking-wide text-ink">Après</span>
        <div aria-hidden className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow" style={{ left: `${pos}%` }} />
        <label htmlFor={id} className="sr-only">Comparer avant et après{pair.title ? ` — ${pair.title}` : ""}</label>
        <input id={id} type="range" min={0} max={100} step={1} value={pos} onChange={(e) => setPos(Number(e.target.value))}
          aria-valuetext={`${pos} % avant`} className="absolute inset-0 size-full cursor-ew-resize opacity-0" />
      </div>
      {pair.title && <figcaption className="mt-3 text-center text-sm text-stone">{pair.title}</figcaption>}
    </figure>
  );
}

export function BeforeAfter({ pairs }: { pairs: BeforeAfterPair[] }) {
  const valid = pairs.filter((p) => realAsset(p.before.path) && realAsset(p.after.path));
  if (valid.length === 0) return null;
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {valid.map((p) => (<li key={p.id}><Comparer pair={p} /></li>))}
    </ul>
  );
}
