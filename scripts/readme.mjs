// Gera o profile/README.md a partir do scripts/readme.modelo.md e do app.json de cada
// app, para a tabela não divergir do manifesto. Rode depois de mudar nome ou descrição de
// um app, ou de acrescentar um em scripts/apps.mjs:
//   node scripts/readme.mjs && npx prettier --write profile/README.md
import fs from "node:fs";
import path from "node:path";
import { APPS, ORG, manifesto } from "./apps.mjs";

const RAW =
  "https://raw.githubusercontent.com/roqueos-apps/.github/main/profile";

function descricao(a, idioma) {
  let d = a.descricao[idioma].trim();
  d = d.charAt(0).toUpperCase() + d.slice(1);
  return /[.!?]$/.test(d) ? d : `${d}.`;
}

function tabela(idioma) {
  if (!APPS.length)
    return idioma === "pt-BR"
      ? "Os apps chegam um de cada vez, conforme saem do RoqueOS. O primeiro é a Calculadora."
      : "Apps arrive one at a time as they leave RoqueOS. The Calculator is the first.";
  const [colApp, colDesc, usar] =
    idioma === "pt-BR"
      ? ["App", "O que é", "Usar"]
      : ["App", "What it is", "Use"];
  const linhas = APPS.map((slug) => {
    const a = manifesto(slug);
    const icone = `<img src="${RAW}/icones/${slug}.png" width="40" height="40" alt="">`;
    return `| ${icone} | [**${a.nome[idioma]}**](https://github.com/roqueos-apps/${slug}) | ${descricao(a, idioma)} | [${usar}](https://roqueos.com.br/app) |`;
  });
  return [
    `| | ${colApp} | ${colDesc} | |`,
    "| :-: | --- | --- | :-: |",
    ...linhas,
  ].join("\n");
}

const md = fs
  .readFileSync(path.join(ORG, "scripts/readme.modelo.md"), "utf8")
  .replace("{{APPS_PT}}", tabela("pt-BR"))
  .replace("{{APPS_EN}}", tabela("en-US"))
  .replaceAll("{{RAW}}", RAW);
if (/\{\{[A-Z_]+\}\}/.test(md))
  throw new Error("marcador sem substituir no modelo");
fs.writeFileSync(path.join(ORG, "profile/README.md"), md);
console.log("ok profile/README.md");
