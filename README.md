# João Roberto 70111 — Landing Page de Campanha

Landing page de campanha para **João Roberto**, candidato a Deputado Estadual
pelo Amazonas (número **70111**), coligação *"Pra Cima, Amazonas"*. Site de
página única (one-page) apresentando o candidato, sua trajetória, propostas de
campanha e canais oficiais de contato.

> Projeto de cliente. Este repositório também é usado como peça de portfólio —
> veja [Conteúdo pendente de confirmação](#conteúdo-pendente-de-confirmação-com-a-campanha)
> antes de reutilizar os dados como referência de outro projeto.

## Stack técnica

- **[Next.js 16](https://nextjs.org/)** (App Router) + **React 19** + **TypeScript**
- CSS puro em `app/globals.css` (sem framework de utilitários) — variáveis CSS
  centralizam cores, tipografia, espaçamento e motion, facilitando manutenção
- **`next/font`** para carregar as fontes do Google (Anton + Barlow Condensed + Barlow)
  com auto-hospedagem e sem layout shift
- **`next/image`** para a foto do candidato — otimização automática de formato
  (WebP/AVIF) e tamanho responsivo, com import estático (o Next lê a
  dimensão real do arquivo automaticamente)
- Sem banco de dados, sem API routes, sem dependências externas de runtime —
  o site é 100% estático (`next build` gera páginas pré-renderizadas)

## Estrutura do projeto

```
├── app/
│   ├── layout.tsx        # Layout raiz: fontes, metadata, <html lang="pt-BR">
│   ├── page.tsx          # Monta as seções da página na ordem final
│   ├── globals.css       # Todo o design system do site (tokens + componentes)
│   └── icon.svg          # Favicon
├── components/
│   ├── content.ts        # Dados oficiais da campanha (CNPJ, coligação, redes e links)
│   ├── Header.tsx         # Ribbon animado (com CNPJ) + menu fixo + menu mobile (client component)
│   ├── Hero.tsx           # Seção principal com a foto recortada
│   ├── About.tsx          # Seção "Sobre" + linha do tempo da trajetória
│   ├── Proposals.tsx      # Grade de propostas de campanha
│   ├── Coalition.tsx      # Seção da coligação "Pra Cima, Amazonas"
│   ├── Social.tsx         # Cards de redes sociais
│   ├── FinalCta.tsx       # Chamada final "Vote 70111"
│   └── Footer.tsx         # Rodapé com card de destaque legal do CNPJ e botão de copiar
├── public/
│   └── images/
│       └── joao-roberto-foto-cutout.png   # Foto oficial com fundo removido
├── next.config.mjs
├── eslint.config.mjs
└── tsconfig.json
```

## Como rodar localmente

Pré-requisitos: [Node.js](https://nodejs.org/) 18.18+ (recomendado 20+) e npm.

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

Outros comandos:

```bash
npm run build   # build de produção
npm run start   # sobe o build de produção localmente
npm run lint    # ESLint (regras do Next.js + TypeScript)
```

## Deploy na Vercel

1. Suba este repositório para o GitHub (ou GitLab/Bitbucket).
2. Em [vercel.com/new](https://vercel.com/new), importe o repositório.
3. A Vercel detecta automaticamente que é um projeto Next.js — não é
   necessário configurar build command, output directory nem variáveis de
   ambiente.
4. Clique em **Deploy**. Cada push para a branch principal gera um novo
   deploy automaticamente.

## Conteúdo e customização

- **Links de redes sociais**: editar `components/content.ts`.
- **Textos de cada seção**: cada seção é um componente próprio em
  `components/`; os textos ficam diretamente no JSX ou em arrays no topo do
  arquivo (`TIMELINE`, `PROPOSALS`, `PARTIES`, `CARDS`).
- **Foto do candidato**: substitua o arquivo em
  `public/images/joao-roberto-foto-cutout.png` (mantenha o fundo transparente)
  e ajuste o `alt` em `components/Hero.tsx`. O `next/image` recalcula a
  proporção automaticamente a partir do arquivo.
- **Cores, tipografia e espaçamento**: tudo centralizado em variáveis CSS no
  topo de `app/globals.css` (bloco `:root`), então uma mudança de cor de marca
  se propaga para o site inteiro.

## Identidade visual

Paleta e tipografia extraídas do material de campanha (banner) fornecido pelo
cliente:

| Token | Valor | Uso |
|---|---|---|
| `--blue` | `#0059B2` | Fundo da seção hero, ícones sociais |
| `--navy` | `#0B2F63` | Seção da coligação, textos de destaque |
| `--navy-deep` | `#081F44` | Ribbon, rodapé, badges |
| `--orange` | `#F0923A` | Cor de ação (CTAs, destaques, selos) |
| `--paper` | `#F5F7FB` | Fundo neutro das seções claras |
| Anton | — | Títulos grandes / números de urna |
| Barlow Condensed | 500–800 | Navegação, rótulos, botões |
| Barlow | 400–700 | Texto corrido |

O padrão diagonal repetindo "70111" ao fundo do hero e da chamada final
reproduz o mesmo recurso visual do banner de campanha original.

### Ajuste de legibilidade

A primeira versão (protótipo estático) recebeu um retorno do cliente sobre
dificuldade de leitura em trechos com o padrão numérico ao fundo. Esta versão
já nasce com o ajuste aplicado: um leve painel/gradiente atrás do texto do
hero e da chamada final, `text-shadow` nos títulos que ficam sobre o padrão, e
menor opacidade do padrão decorativo — mantendo a identidade visual, mas
priorizando a leitura.

## Acessibilidade e responsividade

- Contraste de texto verificado (≥ 4.5:1 em texto de corpo).
- Navegação por teclado com foco visível (`:focus-visible`) e link "pular
  para o conteúdo".
- `prefers-reduced-motion` respeitado (desliga o ribbon animado e transições).
- Layout responsivo com pontos de quebra em 375 / 640 / 768 / 1024px; sem
  rolagem horizontal em nenhum tamanho de tela.
- Alvos de toque com no mínimo 44×44px no menu mobile e botões principais.

## Conteúdo pendente de confirmação com a campanha

Estes pontos vieram do levantamento inicial de pesquisa e **precisam ser
confirmados com o candidato/campanha** antes de qualquer divulgação oficial
maior:

- **Estado civil / vida pessoal**: não incluído no site — há conflito entre o
  registro do TSE ("solteiro") e a bio pública do Instagram ("pai e esposo").
- **CNPJ do comitê financeiro** (`68.404.127/0001-00`): mantido no rodapé
  porque já consta publicamente na peça de campanha usada como referência
  visual, mas não foi validado de forma independente pela Receita/TSE.
- **WhatsApp e Facebook oficiais**: não incluídos por falta de URL confirmada.
- **Dados financeiros/patrimoniais do TSE**: não exibidos no site (conteúdo
  sensível, pouco relevante para uma página de apresentação).

## Sobre a foto do candidato

A foto oficial (fundo branco) foi processada localmente para remoção de fundo
(detecção de fundo conectado às bordas + descontaminação de cor nas bordas do
recorte, via Python/Pillow), pois o serviço de remoção de fundo do ambiente de
design estava sem créditos no momento da produção. O resultado foi conferido
visualmente sobre o fundo azul-marinho do site antes de ser usado — sem halo
branco perceptível. Caso surja uma foto oficial já recortada por um
designer/fotógrafo, basta substituir o arquivo em `public/images/`.
