# roqueos-apps/.github

Os arquivos da organização [roqueos-apps](https://github.com/roqueos-apps):

- [`profile/README.md`](profile/README.md) é a página de apresentação da organização, com os
  apps e as bibliotecas. Nada nela é escrito à mão fora de `scripts/readme.modelo.md`: um só
  comando, `node scripts/gerar.mjs`, descobre os repos da organização pelo `gh` e gera a
  tabela (do `app.json` de cada app), os ícones, a capa (`profile/banner.png`, com os apps da
  página e nada além deles), o [`profile/vitrine.json`](profile/vitrine.json) e as imagens
  sociais. Repo privado ou arquivado fica de fora, com o motivo na vitrine.
- **Quem cobra:** o gate `perfil-da-org` do roqueos-kit, bloqueante no pre-push dos repos de
  app. Ele lê a `vitrine.json` publicada aqui e reprova o push de um app que a página não
  mostra com o nome, a descrição, o ícone e a cor do `app.json` de agora, e o de um repo que a
  vitrine deixou de fora como privado e já abriu. O conserto é sempre o mesmo: rodar o
  `gerar.mjs` aqui e empurrar.
- Os repos da organização e o `roqueos-front` (de onde vêm o Playwright, o Prettier e a fonte
  dos ícones) precisam estar clonados ao lado deste, e o gerador recusa clone atrás do GitHub.
  O avatar e a imagem social sobem pela interface do GitHub; não há API para isso.
- [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md), [`CONTRIBUTING.md`](CONTRIBUTING.md) (com o DCO),
  [`SECURITY.md`](SECURITY.md), [`SUPPORT.md`](SUPPORT.md) e os modelos de issue e pull request
  em [`.github/`](.github) valem para todo repo da organização que não tenha o próprio.
- As [Discussions](https://github.com/orgs/roqueos-apps/discussions) da organização moram
  neste repositório.

Mesmo molde do [roqueos-games/.github](https://github.com/roqueos-games/.github).

The organization's profile page, default community health files (code of conduct,
contributing guide with the DCO sign-off rule, security policy, support, issue and pull
request templates) and the home of the organization's Discussions.
