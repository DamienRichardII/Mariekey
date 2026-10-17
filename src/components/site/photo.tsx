import Image from "next/image";
import { realAsset } from "@/lib/assets";
import { cn } from "@/lib/utils";

type Props = {
  src: string | null | undefined;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  position?: string;
  /** Légende interne de l'emplacement (visible uniquement hors production). */
  expected?: string;
  rounded?: string;
};

/**
 * Photo via next/image si le fichier existe réellement ; sinon emplacement sobre (aucune image inventée).
 * Le parent doit être positionné (relative) et dimensionné.
 */
export function Photo({ src, alt, sizes, className, priority, position, expected, rounded }: Props) {
  const real = realAsset(src);
  if (!real) {
    return (
      <div role="img" aria-label={alt} className={cn("absolute inset-0 grid place-items-center bg-beige/60", rounded, className)}>
        {process.env.NODE_ENV !== "production" && expected ? (
          <span className="px-3 text-center text-[11px] text-stone">Photo attendue : {expected}</span>
        ) : null}
      </div>
    );
  }
  return (
    <Image src={real} alt={alt} fill sizes={sizes} priority={priority}
      className={cn("object-cover", rounded, className)} style={position ? { objectPosition: position } : undefined} />
  );
}
