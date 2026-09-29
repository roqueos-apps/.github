// Monta o profile/README.md a partir do scripts/readme.modelo.md e dos itens que o org.mjs
// descobriu. Quem chama é o scripts/gerar.mjs; não rode este sozinho.
import fs from "node:fs";
import path from "node:path";
import { ORG, ORG_NOME } from "./org.mjs";

const RAW = `https://raw.githubusercontent.com/${ORG_NOME}/.github/main/profile`;
const REPO = (slug) => `https://github.com/${ORG_NOME}/${slug}`;

function frase(d) {
  d = String(d).trim();
  d = d.charAt(0).toUpperCase() + d.slice(1);
  return /[.!?]$/.test(d) ? d : `${d}.`;
}

function tabelaDosApps(apps, idioma) {
  if (!apps.length)
    return idioma === "pt-BR"
      ? "Os apps chegam um de cada vez, conforme saem do RoqueOS."
      : "Apps arrive one at a time as they leave RoqueOS.";
  const [colApp, colDesc, usar] =
    idioma === "pt-BR"
      ? ["App", "O que é", "Usar"]
      : ["App", "What it is", "Use"];
  const linhas = apps.map((a) => {
    const icone = `<img src="${RAW}/icones/${a.repo}.png" width="40" height="40" alt="">`;
    const nome = a.valores[`nome.${idioma}`];
    const desc = frase(a.valores[`descricao.${idioma}`]);
    return `| ${icone} | [**${nome}**](${REPO(a.repo)}) | ${desc} | [${usar}](https://roqueos.com.br/app) |`;
  });
  return [
    `| | ${colApp} | ${colDesc} | |`,
    "| :-: | --- | --- | :-: |",
    ...linhas,
  ].join("\n");
}

// As bibliotecas (o app-sdk, o kit de interface) com a descrição do próprio repo no GitHub,
// que é em português; em inglês, só os nomes.
function bibliotecas(libs, idioma) {
  if (!libs.length) return "";
  if (idioma === "en-US")
    return `Libraries for building an app: ${libs.map((b) => `[\`${b.repo}\`](${REPO(b.repo)})`).join(", ")}.`;
  return [
    "### Para quem constrói um app",
    "",
    "| Repo | O que é |",
    "| --- | --- |",
    ...libs.map(
      (b) => `| [\`${b.repo}\`](${REPO(b.repo)}) | ${frase(b.descricao)} |`,
    ),
  ].join("\n");
}

export function readme(itens) {
  const apps = itens.filter((i) => i.tipo === "app");
  const libs = itens.filter((i) => i.tipo === "biblioteca");
  const md = fs
    .readFileSync(path.join(ORG, "scripts/readme.modelo.md"), "utf8")
    .replace("{{APPS_PT}}", tabelaDosApps(apps, "pt-BR"))
    .replace("{{APPS_EN}}", tabelaDosApps(apps, "en-US"))
    .replace("{{BIBLIOTECAS_PT}}", bibliotecas(libs, "pt-BR"))
    .replace("{{BIBLIOTECAS_EN}}", bibliotecas(libs, "en-US"))
    .replaceAll("{{RAW}}", RAW);
  if (/\{\{[A-Z_]+\}\}/.test(md))
    throw new Error("marcador sem substituir no modelo");
  const saida = path.join(ORG, "profile/README.md");
  fs.writeFileSync(saida, md);
  return saida;
}
