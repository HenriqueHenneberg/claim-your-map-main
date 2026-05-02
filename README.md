# OwnMap

OwnMap e uma plataforma visual de dominacao territorial simbolica. A experiencia principal abre direto em um mapa interativo: o usuario pesquisa paises, estados e cidades, ve quem domina cada territorio, compara rankings locais e simula como ficaria a personalizacao publica do dono.

Este momento do projeto foca no produto desejavel para o usuario comum: mapa bonito, exploracao, busca, camadas, rankings mockados vivos e paginas de territorio. Pagamento real, admin, banco definitivo e autenticacao ficaram fora da interface principal nesta fase.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- D3 Geo + TopoJSON
- `world-atlas` para fronteiras reais de paises
- GeoJSON do IBGE em `public/maps/brazil-states.geojson` para estados brasileiros
- Dados mockados ricos em `src/lib/ownmap-data.ts`

## Experiencia atual

- Home em `/` abre direto no mapa OwnMap.
- Fronteiras reais dos paises no mapa mundial.
- Estados do Brasil desenhados por GeoJSON quando o usuario entra no Brasil.
- Marcadores de cidades brasileiras e internacionais.
- Busca/autocomplete por pais, estado e cidade.
- Zoom por botao, roda do mouse e arrastar o mapa.
- Camadas de exploracao: mundo, pais, estado e cidade.
- Modos do mapa: disputa, arrecadacao, guerra, oportunidade e donos.
- Painel lateral/bottom sheet com dono, banner, mensagem, top 5, eventos, valor simbolico e faltam pontos.
- Personalizacao visual mockada: URL de banner, avatar, mensagem e cor de destaque.
- Lista “Explorar territorios” com filtros.
- Rankings em `/rankings`.
- Pagina detalhada de territorio em `/territory/[slug]`.
- Perfil publico mockado em `/user/[slug]`.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Build

```bash
npm run lint
npm run build
npm run start
```

## Dados geograficos

O mapa mundial usa `world-atlas/countries-110m.json`, com nomes e status enriquecidos por mocks internos. O Brasil usa o arquivo `public/maps/brazil-states.geojson` para desenhar estados com fronteiras reais.

As cidades aparecem como marcadores por coordenadas. O MVP inclui Curitiba, Sao Jose dos Pinhais, Londrina, Maringa, Ponta Grossa, Sao Paulo, Campinas, Santos, Rio de Janeiro, Niteroi, Belo Horizonte, Contagem, Porto Alegre, Caxias do Sul, Florianopolis, Joinville, Salvador, Recife, Fortaleza, Brasilia, Goiania, Manaus, Belem, Vitoria, Cuiaba, Campo Grande e cidades internacionais como Buenos Aires, Lisboa, Paris, Londres, Nova York, Los Angeles e Toquio.

## Identidade

- Nome do produto: OwnMap
- Logo: `public/ownmap-logo.svg`
- Visual: dark premium, mapa grafite, dourado para lideranca, verde para atividade, vermelho/laranja para guerra e cinza para territorios vazios.

## Deploy na Vercel

```bash
npm run build
npx vercel deploy --prod
```

O projeto esta preparado para deploy como app Next.js. Como a home atual usa dados mockados e assets locais, ela nao depende de banco para abrir.

## Limitacoes desta fase

- A personalizacao ainda e preview local no navegador.
- A busca usa dados mockados internos, nao uma API global de geocoding.
- Municipios brasileiros completos podem ser adicionados depois por arquivo GeoJSON/IBGE ou busca sob demanda.
- Pagamentos, webhook, admin e banco definitivo estao fora do foco visual atual e nao aparecem no fluxo principal.

## Proximos passos

- Adicionar municipios completos do Brasil sob demanda por estado.
- Salvar personalizacao do dono em banco.
- Criar upload real de banner/avatar.
- Reativar pagamento e ranking persistente quando a experiencia visual estiver aprovada.
- Adicionar geolocalizacao para “perto de voce”.
