// A lista dos apps abertos da página da organização. App novo entra aqui, na ordem em que
// aparece, e o resto (tabela do README, ícone, imagem social) sai do app.json do repo dele.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ORG = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
// Os repos da organização são clonados lado a lado com este.
export const REPOS = path.resolve(ORG, "..");

// Slug do repo em roqueos-apps. Vazio até o primeiro app sair do RoqueOS (a Calculadora,
// na Onda 3 do Goal 28): a página diz isso em vez de mostrar uma tabela vazia.
export const APPS = [];

if (APPS.length !== new Set(APPS).size) throw new Error("app repetido em APPS");

export function manifesto(slug) {
  const arquivo = path.join(REPOS, slug, "app.json");
  if (!fs.existsSync(arquivo))
    throw new Error(`clone roqueos-apps/${slug} ao lado deste repo`);
  return JSON.parse(fs.readFileSync(arquivo, "utf8"));
}
