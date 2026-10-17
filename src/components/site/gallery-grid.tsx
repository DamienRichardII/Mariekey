"use client";
import Image from "next/image";
import { useState } from "react";
import { Play } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { realAsset } from "@/lib/assets";
import type { Media } from "@/lib/db-types";

/** Grille de la galerie : photos agrandies en modale, vidéos lues au clic (aucun chargement avant le clic). */
export function GalleryGrid({ items }: { items: Media[] }) {
  const [open, setOpen] = useState<Media | null>(null);
  const usable = items.filter((m) => realAsset(m.path));
  const src = open ? realAsset(open.path)! : "";
  return (
    <>
      <ul className="columns-2 gap-3 sm:gap-4 lg:columns-3">
        {usable.map((m) => {
          const s = realAsset(m.path)!;
          const thumb = m.kind === "video" ? s.replace(/\.mp4$/, ".jpg") : s;
          return (
            <li key={m.id} className="mb-3 break-inside-avoid sm:mb-4">
              <button type="button" onClick={() => setOpen(m)} aria-label={`${m.kind === "video" ? "Lire" : "Agrandir"} : ${m.alt}`}
                className="group relative block w-full overflow-hidden rounded-2xl bg-beige">
                <Image src={thumb} alt={m.kind === "video" ? "" : m.alt} width={800} height={1000} sizes="(min-width:1024px) 33vw, 50vw"
                  className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.02]" />
                {m.kind === "video" && (
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="grid size-14 place-items-center rounded-full bg-ink/85 text-white"><Play size={22} fill="currentColor" aria-hidden /></span>
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        {open && (
          <DialogContent title={open.kind === "video" ? "Vidéo" : "Photo"} description={open.alt} className="max-w-3xl">
            {open.kind === "video" ? (
              <video src={src} poster={src.replace(/\.mp4$/, ".jpg")} controls autoPlay playsInline preload="none" className="max-h-[70dvh] w-full rounded-xl bg-ink" />
            ) : (
              <Image src={src} alt={open.alt} width={1200} height={1500} sizes="90vw" className="mx-auto max-h-[70dvh] w-auto rounded-xl object-contain" />
            )}
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
