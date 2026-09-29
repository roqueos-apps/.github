// Descobre os repos da organização pelo gh e decide o que cada um é na página: app (tem
// app.json), biblioteca (código sem manifesto de app) ou fora (privado ou arquivado), com o
// motivo. Não existe lista escrita à mão: repo novo entra sozinho na próxima geração, e o
// gate perfil-da-org do roqueos-kit reprova o push de um app que a página não mostra como ele
// é agora (a regra do founder de 29/09/2026: a capa da org acompanha os apps, sempre).
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ORG_NOME = "roqueos-apps";
export const ORG = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
// Os repos da organização e o roqueos-front são clonados lado a lado com este.
export const REPOS = path.resolve(ORG, "..");
export const FRONT = path.join(REPOS, "roqueos-front");
export const MANIFESTO = "app.json";
// O que a página mostra de cada app. O gate compara exatamente estes campos com o app.json
// do repo que está sendo empurrado; "sha256:x" é o hash do arquivo que o campo x aponta.
export const CAMPOS = [
  "nome.pt-BR",
  "nome.en-US",
  "descricao.pt-BR",
  "descricao.en-US",
  "icone",
  "cor",
];
// A capa desenha até dez apps; com mais, os dez que saíram por último.
export const CAPA_MAX = 10;

// O git sem as variáveis GIT_* de quem chamou: dentro de um hook, elas apontariam para
// outro repo (a lição do tag-na-main do app-sdk).
function ambienteLimpo() {
  const env = { ...process.env };
  for (const k of Object.keys(env)) if (k.startsWith("GIT_")) delete env[k];
  return env;
}
const git = (dir, args) =>
  execFileSync("git", ["-C", dir, ...args], {
    encoding: "utf8",
    env: ambienteLimpo(),
  }).trim();
const gh = (args) =>
  JSON.parse(
    execFileSync("gh", args, { encoding: "utf8", maxBuffer: 64 << 20 }),
  );

export const valor = (obj, campo) =>
  campo.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);

export function valorDoCampo(manifesto, campo, dir) {
  if (!campo.startsWith("sha256:")) return valor(manifesto, campo);
  const alvo = valor(manifesto, campo.slice(7));
  const bytes = fs.readFileSync(path.join(dir, String(alvo)));
  return createHash("sha256").update(bytes).digest("hex").slice(0, 16);
}

// O clone local é a fonte (um nome trocado e ainda não empurrado precisa entrar na página
// antes do push que o gate segura), mas clone atrás do GitHub geraria página velha.
function clone(slug, ramo) {
  const dir = path.join(REPOS, slug);
  if (!fs.existsSync(path.join(dir, ".git")))
    throw new Error(`clone ${ORG_NOME}/${slug} ao lado deste repo`);
  git(dir, ["fetch", "-q", "origin"]);
  const atras = Number(
    git(dir, ["rev-list", "--count", `HEAD..origin/${ramo}`]),
  );
  if (atras)
    throw new Error(
      `o clone de ${slug} está ${atras} commit(s) atrás do GitHub: git -C ${dir} pull`,
    );
  return dir;
}

// Cada repo da organização, na ordem em que foi criado (os apps chegam um de cada vez), com
// o que a página faz dele. O .github é esta página e não entra.
export function descobrir() {
  const repos = gh([
    "api",
    "--paginate",
    "--slurp",
    `orgs/${ORG_NOME}/repos?per_page=100&type=all`,
  ])
    .flat()
    .filter((r) => r.name !== ".github" && !r.fork)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  return repos.map((r) => {
    if (r.archived) return { repo: r.name, tipo: "fora", motivo: "arquivado" };
    if (r.visibility !== "public")
      return { repo: r.name, tipo: "fora", motivo: "privado" };
    const dir = clone(r.name, r.default_branch);
    const arquivo = path.join(dir, MANIFESTO);
    if (!fs.existsSync(arquivo))
      return {
        repo: r.name,
        tipo: "biblioteca",
        descricao: String(r.description || "").trim(),
      };
    const m = JSON.parse(fs.readFileSync(arquivo, "utf8"));
    const valores = Object.fromEntries(
      CAMPOS.map((c) => [c, valorDoCampo(m, c, dir)]),
    );
    for (const [c, v] of Object.entries(valores))
      if (typeof v !== "string" || !v.trim())
        throw new Error(`${r.name}/${MANIFESTO} sem ${c}`);
    return { repo: r.name, tipo: "app", valores };
  });
}

// O contrato com o gate perfil-da-org do roqueos-kit (versão 1): o gate acha o repo em
// itens e, se for app, compara campos.app com o manifesto; se for fora por "privado", confere
// que o repo continua privado.
export function vitrine(itens, capa) {
  return {
    versao: 1,
    org: ORG_NOME,
    pagina: `https://github.com/${ORG_NOME}`,
    gerador: "node scripts/gerar.mjs",
    campos: { app: CAMPOS },
    capa,
    itens,
  };
}
