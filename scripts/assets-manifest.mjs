// Génère src/generated/assets-manifest.json : liste des visuels réellement présents dans /public.
// Permet d'afficher un emplacement sobre (et jamais un faux fichier) quand une photo manque.
import { readdirSync, statSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd(), "public");
const out = path.resolve(process.cwd(), "src/generated/assets-manifest.json");

function walk(dir, base = "") {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const p = path.join(dir, name);
    const rel = `${base}/${name}`;
    return statSync(p).isDirectory() ? walk(p, rel) : [rel];
  });
}

const files = walk(path.join(root, "images"), "/images").concat(walk(path.join(root, "videos"), "/videos")).sort();
mkdirSync(path.dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify({ files }, null, 2) + "\n");
console.log(`assets-manifest: ${files.length} fichiers`);
