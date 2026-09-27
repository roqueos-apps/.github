# roqueos-apps/.github

Os arquivos da organização [roqueos-apps](https://github.com/roqueos-apps):

- [`profile/README.md`](profile/README.md) é a página de apresentação da organização, com a
  lista dos apps. Não edite a tabela à mão: ela sai do `app.json` de cada repo pelo
  `node scripts/readme.mjs`, e o texto em volta mora em `scripts/readme.modelo.md`. App novo
  entra em `scripts/apps.mjs`.
- `node scripts/imagens.mjs` renderiza os ícones e o banner de `profile/`, o avatar da
  organização e a imagem social de cada repo. Os repos dos apps e o `roqueos-front` (de onde
  vêm o Playwright e a fonte dos ícones) precisam estar clonados ao lado deste. O avatar e a
  imagem social sobem pela interface do GitHub; não há API para isso.
- [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md), [`CONTRIBUTING.md`](CONTRIBUTING.md) (com o DCO),
  [`SECURITY.md`](SECURITY.md), [`SUPPORT.md`](SUPPORT.md) e os modelos de issue e pull request
  em [`.github/`](.github) valem para todo repo da organização que não tenha o próprio.
- As [Discussions](https://github.com/orgs/roqueos-apps/discussions) da organização moram
  neste repositório.

Mesmo molde do [roqueos-games/.github](https://github.com/roqueos-games/.github).

The organization's profile page, default community health files (code of conduct,
contributing guide with the DCO sign-off rule, security policy, support, issue and pull
request templates) and the home of the organization's Discussions.
