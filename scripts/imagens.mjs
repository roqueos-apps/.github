// Renderiza as imagens da organização com o Chromium do Playwright, a partir de HTML e do
// app.json de cada app: os ícones e o banner do README (vão para profile/, entram no git) e
// o avatar e a imagem social de cada repo (vão para a pasta de saída, sobem pela interface
// do GitHub: Settings da organização e Settings > Social preview de cada repo).
//   node scripts/imagens.mjs [pasta-de-saída]
// O Playwright e a fonte dos ícones (Material Icons) vêm do node_modules do roqueos-front,
// clonado ao lado. Mesmo molde do roqueos-games/.github.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { APPS, ORG, REPOS, manifesto } from "./apps.mjs";

const FRONT = path.join(REPOS, "roqueos-front");
const { chromium } = createRequire(path.join(FRONT, "package.json"))(
  "playwright",
);
const SAIDA = path.resolve(process.argv[2] || "/tmp/roqueos-apps-org");
const SOCIAL = path.join(SAIDA, "social");
fs.mkdirSync(`${ORG}/profile/icones`, { recursive: true });
fs.mkdirSync(SOCIAL, { recursive: true });

const b64 = (p) => fs.readFileSync(p).toString("base64");
const LOGO = `data:image/png;base64,${b64(`${FRONT}/public/icons/icon-512x512.png`)}`;
const FONTE_DIR = path.join(
  FRONT,
  "node_modules/@quasar/extras/material-icons/web-font",
);
const FONTE = fs.readdirSync(FONTE_DIR).find((f) => f.endsWith(".woff2"));
const ICONES_CSS = `@font-face{font-family:'Material Icons';src:url(data:font/woff2;base64,${b64(path.join(FONTE_DIR, FONTE))}) format('woff2')}
  .mi{font-family:'Material Icons';font-weight:normal;font-style:normal;line-height:1;letter-spacing:normal;
    text-transform:none;white-space:nowrap;word-wrap:normal;direction:ltr;-webkit-font-feature-settings:'liga';font-feature-settings:'liga'}`;
const APPS_INFO = APPS.map((slug) => {
  const m = manifesto(slug);
  return { slug, nome: m.nome["pt-BR"], icone: m.icone, cor: m.cor };
});

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

async function foto(
  page,
  html,
  { w, h, saida, tipo = "png", transparente = false },
) {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
    ${ICONES_CSS}
    html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden;
      font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif;
      -webkit-font-smoothing:antialiased}
  </style></head><body>${html}</body></html>`);
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: saida,
    type: tipo,
    omitBackground: transparente,
    ...(tipo === "jpeg" ? { quality: 88 } : {}),
  });
  console.log("ok", saida, `${(fs.statSync(saida).size / 1024).toFixed(0)} KB`);
}

const tile = (
  cor,
  icone,
  tam,
) => `<div style="width:${tam}px;height:${tam}px;border-radius:${Math.round(tam * 0.23)}px;
  background:linear-gradient(145deg, ${cor} 0%, color-mix(in srgb, ${cor} 62%, #000) 100%);
  display:grid;place-items:center;box-shadow:inset 0 1px 0 rgba(255,255,255,.25)">
  <span class="mi" style="font-size:${Math.round(tam * 0.56)}px;color:#fff">${icone}</span></div>`;

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });

// 1. Avatar 500x500: o R do RoqueOS e o selo da grade de apps.
await foto(
  page,
  `<div style="position:relative;width:500px;height:500px;background:${FUNDO}">
     <img src="${LOGO}" style="position:absolute;left:20px;top:20px;width:336px;height:336px;filter:drop-shadow(0 10px 30px rgba(0,0,0,.45))">
     <div style="position:absolute;right:24px;bottom:24px;width:160px;height:160px;border-radius:50%;
       background:linear-gradient(135deg,#22d3ee 0%,#3b82f6 55%,#8b5cf6 100%);
       box-shadow:0 0 0 10px #0c1f2e, 0 12px 30px rgba(0,0,0,.5);display:grid;place-items:center">
       <div style="width:92px;height:92px">${GRADE}</div>
     </div>
   </div>`,
  { w: 500, h: 500, saida: path.join(SAIDA, "avatar.png") },
);

// 2. Ícone de cada app em PNG, no desenho da Launchpad: cor e ícone do app.json.
for (const a of APPS_INFO) {
  await foto(page, tile(a.cor, a.icone, 128), {
    w: 128,
    h: 128,
    saida: `${ORG}/profile/icones/${a.slug}.png`,
    transparente: true,
  });
}

// 3. Banner do README: nome, uma linha, e uma grade de ícones de sistema em leque. São
//    ícones genéricos de produtividade, não a promessa de um app que ainda não saiu.
const vitrine = [
  ["#ff9500", "calculate"],
  ["#f59e0b", "sticky_note_2"],
  ["#0ea5e9", "schedule"],
  ["#10b981", "qr_code_2"],
  ["#ec4899", "brush"],
  ["#6366f1", "photo_camera"],
  ["#f43f5e", "mic"],
  ["#14b8a6", "map"],
];
const grade = vitrine
  .map(([cor, icone], i) => {
    const col = i % 4;
    const lin = Math.floor(i / 4);
    return `<div style="position:absolute;left:${720 + col * 128 + lin * 40}px;top:${44 + lin * 128}px;
      transform:rotate(${-8 + col * 2}deg);opacity:${1 - lin * 0.15}">${tile(cor, icone, 104)}</div>`;
  })
  .join("");
await foto(
  page,
  `<div style="position:relative;width:1280px;height:320px;background:${FUNDO};overflow:hidden">
     ${grade}
     <div style="position:absolute;inset:0;z-index:20;background:linear-gradient(90deg,#07121c 0%,rgba(7,18,28,.92) 40%,rgba(7,18,28,0) 64%)"></div>
     <img src="${LOGO}" style="position:absolute;z-index:21;left:56px;top:78px;width:96px;height:96px">
     <div style="position:absolute;z-index:21;left:170px;top:80px;color:#fff">
       <div style="font-size:54px;font-weight:800;letter-spacing:-1px;line-height:1">RoqueOS Apps</div>
       <div style="margin-top:14px;font-size:22px;color:rgba(255,255,255,.78);line-height:1.35">
         Os apps do RoqueOS, um repo por app.<br>Use grátis em <b style="color:#7dd3fc">roqueos.com.br</b>
       </div>
     </div>
   </div>`,
  { w: 1280, h: 320, saida: `${ORG}/profile/banner.png` },
);

// 4. Imagem social de cada repo de app (1280x640): o ícone grande e o nome.
for (const a of APPS_INFO) {
  await foto(
    page,
    `<div style="position:relative;width:1280px;height:640px;background:${FUNDO};color:#fff">
       <div style="position:absolute;left:96px;top:170px">${tile(a.cor, a.icone, 300)}</div>
       <div style="position:absolute;left:470px;top:220px">
         <div style="font-size:84px;font-weight:800;letter-spacing:-2px;line-height:1">${a.nome}</div>
         <div style="margin-top:22px;font-size:26px;color:rgba(255,255,255,.72)">roqueos-apps/${a.slug} · use em roqueos.com.br</div>
       </div>
       <img src="${LOGO}" style="position:absolute;right:48px;bottom:44px;width:84px;height:84px">
     </div>`,
    { w: 1280, h: 640, saida: `${SOCIAL}/${a.slug}.jpg`, tipo: "jpeg" },
  );
}

// 5. Imagem social do SDK.
await foto(
  page,
  `<div style="position:relative;width:1280px;height:640px;background:${FUNDO};color:#fff">
     <img src="${LOGO}" style="position:absolute;left:80px;top:96px;width:120px;height:120px">
     <div style="position:absolute;left:80px;top:250px">
       <div style="font-size:84px;font-weight:800;letter-spacing:-2px;font-family:ui-monospace,Menlo,monospace">app-sdk</div>
       <div style="margin-top:18px;font-size:32px;color:rgba(255,255,255,.82);max-width:1000px;line-height:1.35">
         O contrato entre o RoqueOS e um app:<br><span style="font-family:ui-monospace,Menlo,monospace;color:#7dd3fc">mount(el, sistema)</span> e as capacidades do sistema.
       </div>
       <div style="margin-top:34px;font-size:24px;color:rgba(255,255,255,.6)">MIT · DCO · roqueos-apps/app-sdk</div>
     </div>
   </div>`,
  { w: 1280, h: 640, saida: `${SOCIAL}/app-sdk.jpg`, tipo: "jpeg" },
);

await browser.close();
