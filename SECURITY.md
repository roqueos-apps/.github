# Segurança

_English below._

## Como reportar

Não abra issue pública para falha de segurança. Use o **relatório privado de vulnerabilidade**
do GitHub no repositório afetado (aba _Security_, botão _Report a vulnerability_). Ele está
ligado em todos os repositórios públicos da organização.

Se não souber qual repositório é, ou se a falha estiver no RoqueOS em si (o sistema em
roqueos.com.br, não um app), escreva para **contato@levelhard.com.br** com "segurança" no
assunto. A resposta vem em até sete dias.

## O que vale aqui

Os apps desta organização são **de primeira parte** e rodam **na mesma origem** do RoqueOS. O
`app-sdk` entrega capacidades em vez das stores do sistema, mas isso organiza o código e não é
fronteira de segurança. O que protege quem usa o RoqueOS é:

- todo merge passa pela revisão do mantenedor (`CODEOWNERS` em cada repo);
- todo commit declara a origem pelo `Signed-off-by` (DCO), conferido no pull request;
- o RoqueOS instala cada app por uma tag exata, com o commit travado no lockfile, e toda troca
  de versão é revisada antes de entrar;
- nenhum script roda sozinho no install, e o `app check` reprova se aparecer um;
- nenhum app importa o Firebase nem nada de dentro do RoqueOS: quem fala com banco e conta é o
  sistema, e o `app check` reprova o import;
- o CI de pull request não lê segredo nenhum.

Relato que mostre como furar qualquer um desses pontos é exatamente o que queremos receber.

---

## Security (English)

Do not open public issues for vulnerabilities. Use GitHub's private vulnerability reporting on
the affected repository (Security tab, "Report a vulnerability"); it is enabled on every public
repository in this organization. If you are unsure which repository is affected, or the issue
is in RoqueOS itself, email **contato@levelhard.com.br** with "security" in the subject. You get
an answer within seven days.

The apps here are first party and run on the same origin as RoqueOS; the SDK is an
architectural boundary, not a security one. Protection comes from maintainer review on every
merge, signed-off commits (DCO) checked on every pull request, exact version pins in RoqueOS,
no install-time scripts, no Firebase or RoqueOS-internal imports in apps (the `app check`
fails them) and secret-free pull request CI. Reports that break any of these are exactly what
we want.
