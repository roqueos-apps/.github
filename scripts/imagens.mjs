// Renderiza as imagens da organização com o Chromium do Playwright: os ícones e a capa do
// README (vão para profile/, entram no git) e o avatar e a imagem social de cada repo (vão
// para a pasta de saída, sobem pela interface do GitHub: Settings da organização e Settings >
// Social preview de cada repo). A capa desenha os apps que a página lista, com o ícone e a cor
// do app.json de cada um, e nada além deles. Quem chama é o scripts/gerar.mjs.
// O Playwright e a fonte dos ícones (Material Icons) vêm do node_modules do roqueos-front,
// clonado ao lado. Mesmo molde do roqueos-games/.github.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { CAPA_MAX, FRONT, ORG } from "./org.mjs";

const b64 = (p) => fs.readFileSync(p).toString("base64");

function fonteDosIcones() {
  const dir = path.join(
    FRONT,
    "node_modules/@quasar/extras/material-icons/web-font",
  );
  const fonte = fs.readdirSync(dir).find((f) => f.endsWith(".woff2"));
  return `@font-face{font-family:'Material Icons';src:url(data:font/woff2;base64,${b64(path.join(dir, fonte))}) format('woff2')}
  .mi{font-family:'Material Icons';font-weight:normal;font-style:normal;line-height:1;letter-spacing:normal;
    text-transform:none;white-space:nowrap;word-wrap:normal;direction:ltr;-webkit-font-feature-settings:'liga';font-feature-settings:'liga'}`;
}

// A grade de apps, desenho próprio no traço do controle do avatar da roqueos-games.
const GRADE = `
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect x="8" y="8" width="21" height="21" rx="6" fill="#fff"/>
  <rect x="35" y="8" width="21" height="21" rx="6" fill="#fff" opacity=".78"/>
  <rect x="8" y="35" width="21" height="21" rx="6" fill="#fff" opacity=".78"/>
  <rect x="35" y="35" width="21" height="21" rx="6" fill="#fff"/>
</svg>`;

const FUNDO =
  "radial-gradient(120% 120% at 20% 10%, #123a4a 0%, #0c1f2e 55%, #07121c 100%)";

const tile = (
  cor,
  icone,
  tam,
) => `<div style="width:${tam}px;height:${tam}px;border-radius:${Math.round(tam * 0.23)}px;
  background:linear-gradient(145deg, ${cor} 0%, color-mix(in srgb, ${cor} 62%, #000) 100%);
  display:grid;place-items:center;box-shadow:inset 0 1px 0 rgba(255,255,255,.25)">
  <span class="mi" style="font-size:${Math.round(tam * 0.56)}px;color:#fff">${icone}</span></div>`;

// A grade da capa: uma fileira até quatro apps, duas a partir de cinco, alinhada à direita,
// em leque. Devolve o HTML e a ordem em que os apps foram desenhados.
export function gradeDaCapa(apps) {
  const lista = apps.slice(-CAPA_MAX);
  const fileiras = lista.length > 4 ? 2 : 1;
  const porFileira = Math.ceil(lista.length / fileiras);
  const TAM = 104;
  const PASSO = 128;
  const html = lista
    .map((a, i) => {
      const lin = Math.floor(i / porFileira);
      const col = i % porFileira;
      const naFileira = lin === 0 ? porFileira : lista.length - porFileira;
      const largura = naFileira * PASSO - (PASSO - TAM);
      const recuo = fileiras === 2 && lin === 0 ? 48 : 0;
      const x = 1232 - largura - recuo + col * PASSO;
      const y = fileiras === 1 ? 108 : 44 + lin * PASSO;
      return `<div style="position:absolute;left:${x}px;top:${y}px;
        transform:rotate(${-8 + col * 2}deg);opacity:${1 - lin * 0.12}">${tile(a.valores.cor, a.valores.icone, TAM)}</div>`;
    })
    .join("");
  return { html, capa: lista.map((a) => a.repo) };
}

export async function imagens(itens, saida) {
  const { chromium } = createRequire(path.join(FRONT, "package.json"))(
    "playwright",
  );
  const SOCIAL = path.join(saida, "social");
  const ICONES = path.join(ORG, "profile/icones");
  fs.mkdirSync(ICONES, { recursive: true });
  fs.mkdirSync(SOCIAL, { recursive: true });
  const LOGO = `data:image/png;base64,${b64(`${FRONT}/public/icons/icon-512x512.png`)}`;
  const CSS = fonteDosIcones();
  const apps = itens.filter((i) => i.tipo === "app");
  const libs = itens.filter((i) => i.tipo === "biblioteca");
  const feitos = [];

  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  async function foto(
    html,
    { w, h, arquivo, tipo = "png", transparente = false },
  ) {
    await page.setViewportSize({ width: w, height: h });
    await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
      ${CSS}
      html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden;
        font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif;
        -webkit-font-smoothing:antialiased}
    </style></head><body>${html}</body></html>`);
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: arquivo,
      type: tipo,
      omitBackground: transparente,
      ...(tipo === "jpeg" ? { quality: 88 } : {}),
    });
    feitos.push(arquivo);
  }

  // 1. Avatar 500x500: o R do RoqueOS e o selo da grade de apps.
  await foto(
    `<div style="position:relative;width:500px;height:500px;background:${FUNDO}">
       <img src="${LOGO}" style="position:absolute;left:20px;top:20px;width:336px;height:336px;filter:drop-shadow(0 10px 30px rgba(0,0,0,.45))">
       <div style="position:absolute;right:24px;bottom:24px;width:160px;height:160px;border-radius:50%;
         background:linear-gradient(135deg,#22d3ee 0%,#3b82f6 55%,#8b5cf6 100%);
         box-shadow:0 0 0 10px #0c1f2e, 0 12px 30px rgba(0,0,0,.5);display:grid;place-items:center">
         <div style="width:92px;height:92px">${GRADE}</div>
       </div>
     </div>`,
    { w: 500, h: 500, arquivo: path.join(saida, "avatar.png") },
  );

  // 2. Ícone de cada app, no desenho da Launchpad. Ícone de app que saiu da página sai junto.
  const atuais = new Set(apps.map((a) => `${a.repo}.png`));
  for (const f of fs.readdirSync(ICONES))
    if (f.endsWith(".png") && !atuais.has(f)) fs.rmSync(path.join(ICONES, f));
  for (const a of apps)
    await foto(tile(a.valores.cor, a.valores.icone, 128), {
      w: 128,
      h: 128,
      arquivo: path.join(ICONES, `${a.repo}.png`),
      transparente: true,
    });

  // 3. A capa do README: o nome, uma linha e os apps da página, em leque.
  const { html, capa } = gradeDaCapa(apps);
  await foto(
    `<div style="position:relative;width:1280px;height:320px;background:${FUNDO};overflow:hidden">
       ${html}
       <div style="position:absolute;inset:0;z-index:20;background:linear-gradient(90deg,#07121c 0%,rgba(7,18,28,.92) 40%,rgba(7,18,28,0) 64%)"></div>
       <img src="${LOGO}" style="position:absolute;z-index:21;left:56px;top:78px;width:96px;height:96px">
       <div style="position:absolute;z-index:21;left:170px;top:80px;color:#fff">
         <div style="font-size:54px;font-weight:800;letter-spacing:-1px;line-height:1">RoqueOS Apps</div>
         <div style="margin-top:14px;font-size:22px;color:rgba(255,255,255,.78);line-height:1.35">
           Os apps do RoqueOS, um repo por app.<br>Use grátis em <b style="color:#7dd3fc">roqueos.com.br</b>
         </div>
       </div>
     </div>`,
    { w: 1280, h: 320, arquivo: path.join(ORG, "profile/banner.png") },
  );

  // 4. Imagem social de cada app (1280x640): o ícone grande e o nome.
  for (const a of apps)
    await foto(
      `<div style="position:relative;width:1280px;height:640px;background:${FUNDO};color:#fff">
         <div style="position:absolute;left:96px;top:170px">${tile(a.valores.cor, a.valores.icone, 300)}</div>
         <div style="position:absolute;left:470px;top:220px">
           <div style="font-size:84px;font-weight:800;letter-spacing:-2px;line-height:1">${a.valores["nome.pt-BR"]}</div>
           <div style="margin-top:22px;font-size:26px;color:rgba(255,255,255,.72)">roqueos-apps/${a.repo} · use em roqueos.com.br</div>
         </div>
         <img src="${LOGO}" style="position:absolute;right:48px;bottom:44px;width:84px;height:84px">
       </div>`,
      {
        w: 1280,
        h: 640,
        arquivo: path.join(SOCIAL, `${a.repo}.jpg`),
        tipo: "jpeg",
      },
    );

  // 5. Imagem social de cada biblioteca: o nome do repo e a descrição dele no GitHub.
  for (const b of libs) {
    const desc = b.descricao.replace(/\s*MIT\.?$/, "");
    await foto(
      `<div style="position:relative;width:1280px;height:640px;background:${FUNDO};color:#fff">
         <img src="${LOGO}" style="position:absolute;left:80px;top:96px;width:120px;height:120px">
         <div style="position:absolute;left:80px;top:250px">
           <div style="font-size:84px;font-weight:800;letter-spacing:-2px;font-family:ui-monospace,Menlo,monospace">${b.repo}</div>
           <div style="margin-top:18px;font-size:30px;color:rgba(255,255,255,.82);max-width:1080px;line-height:1.35">${desc}</div>
           <div style="margin-top:30px;font-size:24px;color:rgba(255,255,255,.6)">MIT · DCO · roqueos-apps/${b.repo}</div>
         </div>
       </div>`,
      {
        w: 1280,
        h: 640,
        arquivo: path.join(SOCIAL, `${b.repo}.jpg`),
        tipo: "jpeg",
      },
    );
  }

  await browser.close();
  return { capa, feitos };
}
