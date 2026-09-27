# Como contribuir

Obrigado por querer ajudar. Esta é a régua comum a todos os repositórios da organização; o
`CONTRIBUTING.md` de cada app acrescenta o que é só dele (chave de armazenamento que não pode
mudar, nome de evento, regra de cálculo).

_English below._

1. **Abra uma issue antes** de mudar o que a pessoa vê ou o jeito como o app funciona.
   Correção pequena (texto, bug óbvio, teste) pode ir direto para o PR.
2. Faça o fork, crie um branch e rode `yarn install --ignore-scripts`. É Yarn 1.22 e Node 22
   ou mais novo.
3. **Todo commit leva `Signed-off-by`** (o [DCO](https://developercertificate.org/)): é o
   `git commit -s`, que declara que você tem o direito de mandar aquele código. O check `dco`
   do pull request reprova commit sem a linha. Esqueceu? `git rebase --signoff main` e push de
   novo.
4. **Toda correção vem com um teste que reprova sem ela.** Teste que passa com e sem a mudança
   não prova nada.
5. Texto novo entra em `i18n/`, com as mesmas chaves em todos os arquivos. App de primeira
   parte fala os dez idiomas do RoqueOS; o `app check` reprova se faltar um.
6. Arquivo novo em `public/` precisa de uma linha no `ASSETS.md` com a licença e a origem.
   Asset sem origem clara não entra.
7. Rode `yarn verificar` antes de abrir o PR. É o mesmo que o CI roda.
8. O app fala com o RoqueOS só pelo `app-sdk`. Se ele precisa de algo que o sistema não
   entrega, a conversa é uma issue no
   [app-sdk](https://github.com/roqueos-apps/app-sdk/issues), não um atalho no app.

Código, comentários e mensagens de commit são em português do Brasil. Issue e PR em inglês são
bem-vindos, e a resposta vem no idioma em que você escreveu.

Todo merge passa pela revisão do mantenedor. Uma versão nova de app só chega a
[roqueos.com.br](https://roqueos.com.br) quando o RoqueOS troca a tag que ele instala, então o
seu PR aparece no ar na próxima release depois do merge.

Ao participar você concorda com o [código de conduta](CODE_OF_CONDUCT.md). Contribuições
entram sob a licença do repositório (MIT).

---

## Contributing (English)

Open an issue before changing what people see or how an app behaves; small fixes can go
straight to a pull request. Fork, branch, `yarn install --ignore-scripts` (Yarn 1.22, Node
22+). Every commit must be signed off (`git commit -s`, the
[Developer Certificate of Origin](https://developercertificate.org/)); the `dco` check fails
pull requests with unsigned commits, and `git rebase --signoff main` fixes them. Every fix comes
with a test that fails without it. New text goes into every `i18n/*.json` file (first-party
apps speak all ten RoqueOS languages); every new file in `public/` needs a line in `ASSETS.md`
with its license and origin. Run `yarn verificar` before the pull request; it is what CI runs.
Apps talk to RoqueOS only through the `app-sdk`: if an app needs something the system does not
offer, open an issue on the SDK instead of working around it.

Code and comments are in Brazilian Portuguese; issues and pull requests in English are
welcome. Every merge is reviewed by the maintainer, and a merged change reaches roqueos.com.br
in the next RoqueOS release that bumps the app's tag. By contributing you agree to the
[code of conduct](CODE_OF_CONDUCT.md) and license your work under the repository's MIT
license.
