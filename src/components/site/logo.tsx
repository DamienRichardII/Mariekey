import Image from "next/image";
import { logoAsset } from "@/lib/assets";
import { cn } from "@/lib/utils";

/**
 * Logo : utilise le fichier fourni (public/images/logo/logo.svg|png|webp) dès qu'il existe.
 * En attendant, une composition typographique PROVISOIRE (non-définitive) tient la place du logo.
 */
export function Logo({ size = "md", className, inverted = false }: { size?: "sm" | "md" | "xl"; className?: string; inverted?: boolean }) {
  const file = logoAsset();
  const heights = { sm: 28, md: 40, xl: 120 } as const;
  if (file) {
    return (
      <Image src={file} alt="Mariekey Expert" width={heights[size] * 4} height={heights[size]} priority={size === "xl"}
        className={cn("h-auto w-auto", className)} style={{ height: heights[size] }} />
    );
  }
  const text = { sm: "text-[22px]", md: "text-[28px]", xl: "text-[clamp(3.25rem,9vw,6.5rem)]" }[size];
  const sub = { sm: "text-[8px] tracking-[0.38em]", md: "text-[9px] tracking-[0.4em]", xl: "text-[clamp(0.9rem,2vw,1.5rem)] tracking-[0.5em]" }[size];
  return (
    <span className={cn("inline-flex flex-col leading-none", inverted ? "text-white" : "text-ink", className)} role="img" aria-label="Mariekey Expert">
      <span className={cn("font-sans", text)} aria-hidden>
        <span className="font-light">Marie</span><span className="font-semibold">key</span>
      </span>
      <span className={cn("mt-1.5 pl-[0.2em] font-sans font-medium uppercase", sub)} aria-hidden>Expert</span>
    </span>
  );
}
