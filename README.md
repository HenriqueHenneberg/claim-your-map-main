# OwnMap

OwnMap e uma plataforma visual de dominacao territorial simbolica. A experiencia principal abre direto em um mapa interativo: o usuario pesquisa paises, estados e cidades, ve quem domina cada territorio, compara rankings locais, entende quanto falta para passar alguem e simula uma disputa.

Esta fase do projeto foca no produto desejavel para o usuario comum: mapa bonito, exploracao, busca, camadas, rankings mockados vivos, paginas sociais e personalizacao visual. Pagamento real, admin, banco definitivo e autenticacao ficaram fora da interface principal por enquanto.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- D3 Geo + TopoJSON
- `world-atlas` para fronteiras reais de paises
- GeoJSON do IBGE em `public/maps/brazil-states.geojson` para estados brasileiros
- Dados mockados ricos em `src/lib/ownmap-data.ts`

## Experiencia Atual

- Home em `/` abre direto no mapa OwnMap.
- Fronteiras reais dos paises no mapa mundial.
- Estados do Brasil desenhados por GeoJSON quando o usuario entra no Brasil.
- Marcadores de cidades brasileiras e internacionais.
- Busca/autocomplete por pais, estado, cidade e aliases.
- Zoom por botao, roda do mouse e arrastar o mapa.
- Scroll sobre o mapa controla o zoom sem rolar a pagina junto.
- Camadas de exploracao: mundo, pais, estado e cidade.
- Breadcrumb de navegacao: Mundo > Brasil > Parana > Curitiba.
- Modos do mapa: disputa, arrecadacao, guerra, oportunidade e donos.
- Painel lateral/bottom sheet com dono, banner, mensagem, top 3, top 10/50/100, eventos, valor simbolico e faltam pontos.
- Simulador de disputa com valores rapidos e impacto de posicao.
- Personalizacao visual mockada: URL de banner, avatar, mensagem e cor de destaque.
- Lista "Explorar territorios" com filtros.
- Rankings em `/rankings`.
- Pagina detalhada de territorio em `/territory/[slug]`.
- Perfil publico social em `/user/[slug]`.

## Rodando Localmente

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

## Dados Geograficos

O mapa mundial usa `world-atlas/countries-110m.json`, com nomes e status enriquecidos por mocks internos. O Brasil usa `public/maps/brazil-states.geojson` para desenhar estados com fronteiras reais.

As cidades aparecem como marcadores por coordenadas. O pacote leve atual inclui cidades brasileiras como Curitiba, Sao Jose dos Pinhais, Londrina, Maringa, Ponta Grossa, Cascavel, Foz do Iguacu, Sao Paulo, Campinas, Santos, Guarulhos, Rio de Janeiro, Niteroi, Belo Horizonte, Contagem, Porto Alegre, Caxias do Sul, Florianopolis, Joinville, Salvador, Recife, Fortaleza, Brasilia, Goiania, Manaus, Belem, Vitoria, Cuiaba e Campo Grande.

Tambem inclui cidades internacionais como Buenos Aires, Cordoba, Montevideu, Santiago, Lisboa, Porto, Madrid, Barcelona, Paris, Londres, Berlin, Rome, Amsterdam, New York, Miami, Los Angeles, Chicago, Tokyo, Seoul, Beijing, Shanghai, Dubai e Mexico City.

## Identidade

- Nome do produto: OwnMap
- Logo: `public/ownmap-logo.svg`
- Visual: dark premium, mapa grafite, dourado para lideranca, verde para atividade, vermelho controlado para guerra e cinza para territorios vazios.

## Deploy na Vercel

```bash
npm run build
npx vercel deploy --prod
```

O projeto esta preparado para deploy como app Next.js. Como a home atual usa dados mockados e assets locais, ela nao depende de banco para abrir.

## Limitacoes Desta Fase

- A personalizacao ainda e preview local no navegador.
- A busca usa um pacote local leve de paises, estados, cidades e aliases, nao uma API global completa.
- Municipios brasileiros completos podem ser adicionados depois por arquivo IBGE/GeoNames processado.
- Admin, Pix, webhook, login e banco definitivo estao fora do foco visual atual.
- Admin 1 global fora do Brasil ainda deve entrar em uma proxima rodada com carregamento sob demanda.

## Proximos Passos

- Adicionar municipios completos do Brasil sob demanda por estado.
- Adicionar camada Admin 1 global para provincias/estados fora do Brasil.
- Salvar personalizacao do dono em banco.
- Criar upload real de banner/avatar com moderacao.
- Reativar pagamento e ranking persistente quando a experiencia visual estiver aprovada.
- Adicionar geolocalizacao para "perto de voce".
