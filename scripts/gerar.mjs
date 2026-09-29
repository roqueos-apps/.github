// O único comando da página da organização: descobre os repos pelo gh, gera o
// profile/README.md, os ícones, a capa e o profile/vitrine.json, e formata. Rode depois de
// abrir, criar ou arquivar um repo, ou de mudar nome, descrição, ícone ou cor num app.json;
// o gate perfil-da-org do roqueos-kit reprova o push do app até a página acompanhar.
//   node scripts/gerar.mjs [pasta-das-imagens-sociais]
// Precisa do gh logado e dos repos e do roqueos-front clonados ao lado deste.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { FRONT, ORG, descobrir, vitrine } from "./org.mjs";
import { readme } from "./readme.mjs";
import { imagens } from "./imagens.mjs";

const saida = path.resolve(process.argv[2] || "/tmp/roqueos-apps-org");
const itens = descobrir();
const readmeMd = readme(itens);
const { capa, feitos } = await imagens(itens, saida);
const arquivoVitrine = path.join(ORG, "profile/vitrine.json");
fs.writeFileSync(
  arquivoVitrine,
  `${JSON.stringify(vitrine(itens, capa), null, 2)}\n`,
);
execFileSync(
  path.join(FRONT, "node_modules/.bin/prettier"),
  ["--write", readmeMd, arquivoVitrine],
  { stdio: "ignore" },
);

for (const i of itens)
  console.log(
    `${i.tipo.padEnd(10)} ${i.repo}${i.motivo ? ` (${i.motivo})` : ""}${i.tipo === "app" ? `: ${i.valores["nome.pt-BR"]}` : ""}`,
  );
console.log(`capa: ${capa.join(", ") || "(nenhum app)"}`);
console.log(`${feitos.length} imagens; as sociais e o avatar em ${saida}`);
