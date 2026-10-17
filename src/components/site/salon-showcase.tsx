"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Play } from "lucide-react";
import { realAsset } from "@/lib/assets";
import type { Media } from "@/lib/db-types";
import { cn } from "@/lib/utils";

/** Grande photo (ou vraie vidéo) + miniatures sélectionnables. Le bouton lecture n'apparaît que pour une vraie vidéo. */
export function SalonShowcase({ items }: { items: Media[] }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const usable = items.filter((m) => realAsset(m.path));
  if (usable.length === 0) return null;
  const current = usable[Math.min(index, usable.length - 1)];
  const src = realAsset(current.path)!;
  const poster = current.kind === "video" ? src.replace(/\.mp4$/, ".jpg") : null;

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-beige shadow-soft">
        {current.kind === "video" ? (
          playing ? (
            <video src={src} poster={poster ?? undefined} controls autoPlay playsInline preload="none" className="absolute inset-0 size-full object-cover" />
          ) : (
            <>
              {poster && <Image src={poster} alt={current.alt} fill sizes="(min-width:1024px) 55vw, 100vw" className="object-cover" />}
              <button type="button" onClick={() => setPlaying(true)} aria-label="Lire la vidéo du salon"
                className="absolute inset-0 m-auto grid size-16 place-items-center rounded-full bg-ink/85 text-white transition-transform hover:scale-105">
                <Play size={26} fill="currentColor" aria-hidden />
              </button>
            </>
          )
        ) : (
          <Image key={src} src={src} alt={current.alt} fill sizes="(min-width:1024px) 55vw, 100vw" className="object-cover" />
        )}
      </div>

      <div>
        <h2 className="font-serif text-4xl sm:text-5xl">Notre salon</h2>
        <span className="mt-5 block h-px w-14 bg-walnut/60" aria-hidden />
        {usable.length > 1 && (
          <ul className="mt-8 grid grid-cols-4 gap-3" aria-label="Photos du salon">
            {usable.map((m, i) => {
              const s = realAsset(m.path)!;
              const thumb = m.kind === "video" ? s.replace(/\.mp4$/, ".jpg") : s;
              return (
                <li key={m.id}>
                  <button type="button" onClick={() => { setIndex(i); setPlaying(false); }} aria-label={`Afficher : ${m.alt}`} aria-pressed={i === index}
                    className={cn("relative block aspect-square w-full overflow-hidden rounded-xl border-2 transition-all", i === index ? "border-ink" : "border-transparent opacity-80 hover:opacity-100")}>
                    <Image src={thumb} alt="" fill sizes="120px" className="object-cover" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <Link href="/a-propos" className="mt-8 inline-flex min-h-11 items-center gap-2 border-b border-ink pb-0.5 text-[15px] font-medium hover:text-walnut">
          Découvrir le salon <ArrowRight size={16} aria-hidden />
        </Link>
      </div>
    </div>
  );
}
