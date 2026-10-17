import manifest from "@/generated/assets-manifest.json";

const files = new Set<string>(manifest.files);

/** Retourne le chemin si le fichier existe réellement dans /public, sinon null (emplacement sobre). */
export function realAsset(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return files.has(path) ? path : null;
}

export function logoAsset(): string | null {
  for (const ext of ["svg", "png", "webp"]) {
    const p = `/images/logo/logo.${ext}`;
    if (files.has(p)) return p;
  }
  return null;
}
