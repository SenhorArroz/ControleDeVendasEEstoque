# Revisão de responsividade — CashFlow

Data: 16/10/2026. Responsável: Diego.

## Resultado e limites

Revisados os 38 arquivos TSX originais de interface: 18 páginas, a página 404, o layout global e 18 componentes. Foram acrescentados dois componentes compartilhados, totalizando 40 arquivos de interface. Alterações feitas com utilitários Tailwind, preservando cores, identidade, conteúdo, rotas, regras de negócio e integrações.

A rodada final verificou 39 páginas/estados × 34 tamanhos = **1.326 verificações**, sem overflow horizontal global nem caixas de modal fora da viewport nos dados simulados. Após corrigir a quebra de etiquetas de categoria, o catálogo foi confirmado novamente nos mesmos 34 tamanhos. Isso é evidência de layout em Chrome/Chromium com HTML renderizado a partir dos componentes reais e dados simulados; não é validação integral da aplicação autenticada.

## 1. Views analisadas

Todos os itens abaixo foram examinados. Páginas que delegam a renderização foram verificadas junto com seus componentes.

| Rota / superfície | Arquivo em `src/app/` | Principais verificações |
|---|---|---|
| `/` | `page.tsx` | Navegação, acesso ao login no celular, hero, cards, CTA, decoração |
| `/login` | `login/page.tsx` | Formulário, botão voltar no fluxo, padding, alturas curtas |
| `/register` | `register/page.tsx` | Ambos os passos, upload, campos, ações empilhadas |
| `/forgot-password` | `forgot-password/page.tsx` | Formulário e confirmação com e-mail longo |
| `/forgot-password/[token]` | `forgot-password/[token]/page.tsx` | Campos, mensagens, espaçamentos |
| `/dashboard` | `dashboard/page.tsx` | KPIs, gráfico, transações, ações rápidas, largura máxima |
| `/produtos` | `produtos/page.tsx` | Busca, filtros, dropdown, tabela, cadastro/edição |
| `/produtos/[id]` | `produtos/[id]/page.tsx` | Menu móvel, detalhes, imagem, códigos, métricas, modal |
| `/clientes` | `clientes/page.tsx` | Busca, filtros, tabela, cadastro, edição, exclusão |
| `/clientes/[id]` | `clientes/[id]/page.tsx` | Contatos, métricas, pedidos expandidos, ações e três modais |
| `/fornecedores` | `fornecedores/page.tsx` | Busca, tabela, cadastro, contatos e ações |
| `/fornecedores/[id]` | `fornecedores/[id]/page.tsx` | Detalhes, produtos vinculados, endereço e edição |
| `/categorias` | `categorias/page.tsx` | Listagem e modal nativo de cadastro/edição |
| `/funcionarios` | `funcionarios/page.tsx` | Cabeçalho, tabela, formulário de cadastro |
| `/financeiro` | `financeiro/page.tsx` | KPIs, legendas, gráfico, duas tabelas, paginação e despesa |
| `/historico` | `historico/page.tsx` | Menu móvel, busca, filtros, eventos, valores e conteúdo longo |
| `/configuracoes` | `configuracoes/page.tsx` | Perfil, estatísticas, edição, área de exclusão e modal |
| `/registrarCompra` | `registrarCompra/page.tsx` | Catálogo, categorias, carrinho, checkout e dois overlays |
| 404 | `not-found.tsx` | Tipografia, altura, ações e decoração |
| Layout global | `layout.tsx` | Providers, fonte, tema, estrutura; mantido |

## 2. Componentes analisados

Em `src/app/_components/`: `SideBar`, `ProductTableShow`, `ClienteTableComponent`, `DashboardCharts`, `FinancialChart`, `FinancialActions` (exportação e despesa), `ExpenseActions`, `ThemeToggle`, `signOutButton`, `AuthProvider` e `auth-provider`.

Componentes de área: `categorias/_components/CategoryManager`, `clientes/_components/clientsPaienl`, `clientes/[id]/client-view`, `configuracoes/_components/ConfigPainel`, `fornecedores/[id]/client`, `historico/history-view` e `produtos/[id]/_components/ProductDetailClient`.

Novos componentes: `MobileNav` e `TableViewport`. Providers não possuem layout visual; alternância de tema e logout mantiveram seu comportamento. Avatares e ícones preservam tamanhos fixos apropriados.

## 3. Principais problemas encontrados

- PDV com `h-screen`, overflow bloqueado, catálogo e carrinho com altura completa e carrinho fixo de 480px: risco de checkout inacessível no celular e pouco espaço no notebook.
- Histórico e detalhes de produto sem acionador de navegação móvel.
- Sidebar de 65vw estreita para o próprio branding em 320px.
- Páginas sem limite de largura coerente em ultrawide e uso de `overflow-x-hidden` em conteúdos principais.
- Cabeçalhos, filtros e ações de modal que disputavam a mesma linha em larguras pequenas/intermediárias.
- Padding de 40–48px consumindo a área de formulários no celular; botão voltar absoluto sobre o conteúdo de autenticação em telas baixas.
- Grids com itens incapazes de encolher e campos que podiam impor sua largura intrínseca.
- Códigos, nomes e valores longos quebrando hierarquia; etiquetas de categoria sem quebra invadindo a célula seguinte.
- Alvos de ação de 28–36px; modais dependentes de `vh` e sem limite explícito em todos os casos.

## 4. Arquivos modificados

Lista dos 29 arquivos existentes com mudanças funcionais de apresentação:

- `src/app/_components/ClienteTableComponent.tsx`
- `src/app/_components/DashboardCharts.tsx`
- `src/app/_components/ExpenseActions.tsx`
- `src/app/_components/FinancialActions.tsx`
- `src/app/_components/FinancialChart.tsx`
- `src/app/_components/ProductTableShow.tsx`
- `src/app/_components/SideBar.tsx`
- `src/app/categorias/_components/CategoryManager.tsx`
- `src/app/categorias/page.tsx`
- `src/app/clientes/[id]/client-view.tsx`
- `src/app/clientes/_components/clientsPaienl.tsx`
- `src/app/configuracoes/_components/ConfigPainel.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/financeiro/page.tsx`
- `src/app/forgot-password/[token]/page.tsx`
- `src/app/forgot-password/page.tsx`
- `src/app/fornecedores/[id]/client.tsx`
- `src/app/fornecedores/page.tsx`
- `src/app/funcionarios/page.tsx`
- `src/app/historico/history-view.tsx`
- `src/app/historico/page.tsx`
- `src/app/login/page.tsx`
- `src/app/not-found.tsx`
- `src/app/page.tsx`
- `src/app/produtos/[id]/_components/ProductDetailClient.tsx`
- `src/app/produtos/[id]/page.tsx`
- `src/app/produtos/page.tsx`
- `src/app/register/page.tsx`
- `src/app/registrarCompra/page.tsx`

Adicionados: `src/app/_components/MobileNav.tsx`, `src/app/_components/TableViewport.tsx`, `scripts/check-responsive.cjs`, este relatório e `docs/responsividade-resultados.json`.

## 5. Principais mudanças

- Conteúdo central limitado a `max-w-screen-2xl` ou ao limite específico já adequado à página, com `mx-auto`, padding responsivo e `min-w-0`.
- Remoção do ocultamento horizontal dos conteúdos principais. Recortes de imagens, decoração e o shell do PDV desktop permanecem localizados onde têm propósito visual.
- Navegação móvel compartilhada abaixo de `lg`, acionada por botão; sidebar lateral persistente em `lg+`, com altura dinâmica e rolagem própria.
- Todos os dez pontos de tabela usam região local rolável, acessível por teclado, com orientação no celular. Dados e ações continuam presentes. As larguras mínimas de tabelas densas foram mantidas para preservar leitura e comparação.
- Modais limitados a `90dvh`, rolagem vertical, cabeçalhos que não encolhem e rodapés com ações empilhadas no celular. Os formulários extensos mantêm rolagem interna.
- Campos podem encolher, respeitam o container e usam texto de 16px no celular. Ações pequenas passaram a dimensões maiores; campos e dados não foram renomeados.
- Grids e detalhes reorganizados, incluindo inventário em uma coluna no celular e detalhes em três colunas somente a partir de `xl`.
- PDV com rolagem normal no celular/tablet e duas colunas em `lg+`, carrinho de 384px em `lg` e 480px em `xl`; catálogo adapta colunas ao espaço restante. Indicador do carrinho funciona como atalho ao checkout no celular.
- Valores monetários de tabelas permanecem inteiros; nomes, descrições, identificadores e categorias podem quebrar conforme o contexto.
- Não foram alterados arquivos de servidor, serviços, banco, APIs, validações, autenticação ou cálculos. Conferência dos atributos de formulário não encontrou remoção de IDs, nomes, bindings ou eventos existentes; foram adicionados apenas os IDs de navegação e checkout.

## 6. Verificações e testes manuais pendentes

### Executados

- Inspeção do código de todas as views e componentes e nova busca global por larguras, grids, posições, tabelas, modais e overflow.
- CSS Tailwind/DaisyUI compilado localmente pelo verificador, inclusive `max-w-screen-2xl` e unidades dinâmicas.
- 1.326 verificações em Chromium e confirmação focada do catálogo em mais 34 tamanhos, com nomes extensos, identificadores sem espaços e valores altos.
- Todos os tamanhos pedidos: 320×568; 360×640/800; 375×667/812; 390×844; 393×852; 412×915; 414×896; 430×932; 600×960; 720×1024; 768×1024; 800×1280; 820×1180; 834×1194; 1024×1366/768; 1280×720/800; 1366×768; 1440×900; 1536×864; 1920×1080; 2560×1440/1080; 3840×2160/1600; 3440×1440; 5120×1440; 640×360; 667×375; 844×390; 915×412.
- Capturas de desktop e mobile revisadas; transições de drawers/modais foram estabilizadas em capturas complementares.
- TypeScript do código-fonte passou com `.next` excluído temporariamente. A configuração do projeto foi preservada.
- `npm run typecheck` antes da geração de `.next/types` passou. Depois do build, revela três incompatibilidades preexistentes com parâmetros assíncronos do Next; ver seção 8.
- `npm run build` tentou gerar o Prisma Client e compilar o Next. Parou por DNS ao buscar Geist em `fonts.googleapis.com`. Build de produção não confirmado.
- Detector Impeccable apontou 19 avisos estéticos (16 de cinza em fundos coloridos, um de paleta e dois de texto em gradiente); mantidos por fazerem parte da identidade solicitada, sem redesenho de cores.

### Ainda exigem teste manual

- Login real, permissões, cadastros, edição, exclusão, venda paga/fiado, exportação e upload com a configuração e serviços reais.
- Gráficos Recharts após hidratação: o renderizador estático testa seus containers, não desenha as séries. Os avisos de dimensão -1 são do SSR de teste.
- Teclado virtual, zoom, safe areas e barras móveis em Safari/iPhone e Chrome/Android físicos; o ambiente usou Chromium com viewport redimensionada.
- Navegação completa por teclado, foco ao abrir/fechar modais e menus, toque/arraste de tabelas e filtros, scroll até o fim de modais na horizontal.
- Menus com muitas categorias, carrinhos grandes e imagens reais. O runner usa fixtures representativas, sem executar mutações nem hidratar os handlers React.
- Aparência final com Geist: as capturas usam a fonte fallback do ambiente porque a fonte remota não pôde ser baixada.

### Reproduzir

`scripts/check-responsive.cjs` exige as dependências do projeto, Playwright disponível no ambiente de teste (por exemplo via `NODE_PATH`) e Chrome instalado. Não adiciona dependências ao produto nem usa banco ou credenciais.

```text
node scripts/check-responsive.cjs <diretorio-de-saida>
```

Sem argumento, salva em diretório temporário. `RESPONSIVE_BROWSER_CHANNEL=edge` permite Edge; `RESPONSIVE_ROUTE=products` restringe a uma superfície. O runner escreve HTML, capturas e JSON de resultados. O JSON consolidado desta revisão está em `docs/responsividade-resultados.json`.

## 7. Comportamentos diferentes por dispositivo

| Componente | Celular / tablet | Desktop |
|---|---|---|
| Navegação | Botão e drawer temporário abaixo de 1024px | Sidebar de 240px persistente |
| PDV | Catálogo e checkout em sequência; atalho ao carrinho | Duas colunas e rolagem local |
| Catálogo do PDV | 1 coluna base, 2 em sm, 3 em md | 2 em lg, 3 em xl, 4 em 2xl |
| Detalhes de cadastros | Informações empilhadas até xl | Perfil/imagem lateral e área principal |
| Modais | Ações empilhadas, campos em coluna | Ações em linha e grids conforme espaço |
| Tabelas | Orientação e rolagem local preservando dados | Tabela completa com rolagem quando necessária |
| Financeiro | KPIs em uma/duas colunas e legendas reorganizadas | Quatro KPIs em 2xl, tabelas lado a lado em xl |
| Perfil | Sem sticky móvel, ações empilhadas | Perfil lateral sticky e formulário expandido |
| Landing page | Tipografia/padding menores; login sempre acessível | Composição ampla com limites centrais |

## 8. Problemas preexistentes identificados

- `clientes/[id]/page.tsx` e `fornecedores/[id]/page.tsx` declaram `params` síncronos; `financeiro/page.tsx` declara `searchParams` síncrono. Os tipos gerados pelo Next 15 exigem Promise. As assinaturas são anteriores à revisão e foram mantidas para não misturar migração de rotas com apresentação.
- `next.config.mjs` ignora erros de tipos e lint no build; um build concluído não substituiria uma checagem de tipos.
- Não existe `.env` configurado neste checkout; integrações autenticadas não foram exercitadas.
- Modais de `ClienteRow` estão como irmãos de `<tr>` dentro de `<tbody>`; HTML inadequado e risco de avisos de hidratação. O teste estático consegue abrir os diálogos após a correção do DOM pelo navegador, mas isso não comprova a hidratação. A estrutura anterior foi mantida.
- Existem dois providers de autenticação equivalentes; o layout usa `auth-provider`. Nenhuma alteração necessária de responsividade.
- O layout força o tema claro; `ThemeToggle` permanece no projeto, mas o tema forçado limita sua utilidade.
- O perfil usa `/placeholder-user.jpg`, ausente de `public`, quando não há avatar: imagem quebrada no cenário sem foto.
- O histórico contém botões de busca/mais sem ação própria, já existentes; a busca funciona ao digitar e esses handlers não foram inventados nesta revisão.
