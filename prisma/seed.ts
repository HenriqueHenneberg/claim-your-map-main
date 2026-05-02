import {
  PaymentProvider,
  PaymentStatus,
  PrismaClient,
  RankEventType,
  TerritoryStatus,
  TerritoryType,
} from "@prisma/client";

const prisma = new PrismaClient();

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const bannedWords = [
  "admin",
  "moderador",
  "suporte",
  "ofensa",
  "hate",
  "racismo",
  "golpe",
  "script",
  "casino",
  "aposta",
];

const users = [
  ["Matheus Lima", "Curitiba", "Paraná", "Brasil", "Vou tomar Curitiba hoje."],
  ["Ana Kawa", "Curitiba", "Paraná", "Brasil", "Prefeitura em disputa limpa."],
  ["João Pedro", "São José dos Pinhais", "Paraná", "Brasil", "A região metropolitana acordou."],
  ["Bia Martins", "São Paulo", "São Paulo", "Brasil", "Capital não fica sem defesa."],
  ["Leo Santos", "Rio de Janeiro", "Rio de Janeiro", "Brasil", "O topo muda de praia."],
  ["Camila Rocha", "Porto Alegre", "Rio Grande do Sul", "Brasil", "Sul no mapa."],
  ["Rafa Nunes", "Belo Horizonte", "Minas Gerais", "Brasil", "Minas sobe em silêncio."],
  ["Sofia Almeida", "Salvador", "Bahia", "Brasil", "Axé no ranking."],
  ["Davi Costa", "Recife", "Pernambuco", "Brasil", "Recife joga sério."],
  ["Lívia Barros", "Brasília", "Distrito Federal", "Brasil", "DF no comando."],
  ["Tainá Moraes", "Curitiba", "Paraná", "Brasil", "O Paraná é meu tabuleiro."],
  ["Bruno Faria", "São Paulo", "São Paulo", "Brasil", "Presidência simbólica em modo turbo."],
  ["Maria Luiza", "Rio de Janeiro", "Rio de Janeiro", "Brasil", "Subindo ponto por ponto."],
  ["Guilherme Reis", "Belo Horizonte", "Minas Gerais", "Brasil", "BH tem dono."],
  ["Marina Oliveira", "Recife", "Pernambuco", "Brasil", "Top 10 ou nada."],
  ["Caio Prado", "São Paulo", "São Paulo", "Brasil", "São Paulo está em guerra."],
  ["Nina Ferraz", "Porto Alegre", "Rio Grande do Sul", "Brasil", "Rumo ao pódio."],
  ["Igor Campos", "Salvador", "Bahia", "Brasil", "Bahia na pressão."],
  ["Helena Pires", "Brasília", "Distrito Federal", "Brasil", "Quase governadora."],
  ["Vitor Assis", "São José dos Pinhais", "Paraná", "Brasil", "Faltam poucos reais."],
  ["Lucas Gómez", "Buenos Aires", undefined, "Argentina", "Buenos Aires no topo."],
  ["Valentina Rios", "Buenos Aires", undefined, "Argentina", "La ciudad está viva."],
  ["Inês Silva", "Lisboa", undefined, "Portugal", "Lisboa lidera com classe."],
  ["Tiago Pereira", "Lisboa", undefined, "Portugal", "A disputa é diária."],
  ["Ava Johnson", "Nova York", "New York", "Estados Unidos", "NYC is watching."],
  ["Noah Smith", "Nova York", "New York", "Estados Unidos", "Taking the skyline."],
  ["Yuki Tanaka", "Tóquio", undefined, "Japão", "Tokyo never sleeps."],
  ["Haruto Sato", "Tóquio", undefined, "Japão", "Still climbing."],
  ["Sakura Mori", "Tóquio", undefined, "Japão", "Pontos pequenos, efeito grande."],
  ["Emily Brown", "Nova York", "New York", "Estados Unidos", "One block at a time."],
  ["Miguel Sousa", "Lisboa", undefined, "Portugal", "Lisboa pode virar."],
  ["Martina López", "Buenos Aires", undefined, "Argentina", "A poucos pontos."],
  ["Paula Teixeira", "São Paulo", "São Paulo", "Brasil", "Entrando na briga."],
  ["Renan Lopes", "Curitiba", "Paraná", "Brasil", "Curitiba barata demais."],
  ["Samuel Dias", "Rio de Janeiro", "Rio de Janeiro", "Brasil", "Passei para o top 10."],
  ["Clara Mendes", "Salvador", "Bahia", "Brasil", "Salvador ainda vira."],
  ["Isabela Cunha", "Brasília", "Distrito Federal", "Brasil", "DF no radar global."],
  ["Enzo Moura", "Belo Horizonte", "Minas Gerais", "Brasil", "Minas reage."],
  ["Pedro Cardoso", "Recife", "Pernambuco", "Brasil", "Recife está barato."],
  ["Beatriz Gomes", "Porto Alegre", "Rio Grande do Sul", "Brasil", "Sul em guerra."],
] as const;

const territories = [
  ["global", "Mundo", TerritoryType.GLOBAL, undefined, undefined, undefined, 18, 0],
  ["brasil", "Brasil", TerritoryType.COUNTRY, "Brasil", undefined, undefined, -14.235, -51.925],
  ["argentina", "Argentina", TerritoryType.COUNTRY, "Argentina", undefined, undefined, -38.416, -63.616],
  ["portugal", "Portugal", TerritoryType.COUNTRY, "Portugal", undefined, undefined, 39.399, -8.224],
  ["estados-unidos", "Estados Unidos", TerritoryType.COUNTRY, "Estados Unidos", undefined, undefined, 39.828, -98.579],
  ["japao", "Japão", TerritoryType.COUNTRY, "Japão", undefined, undefined, 36.204, 138.252],
  ["parana", "Paraná", TerritoryType.STATE, "Brasil", "Paraná", undefined, -24.89, -51.55],
  ["estado-de-sao-paulo", "São Paulo", TerritoryType.STATE, "Brasil", "São Paulo", undefined, -22.19, -48.79],
  ["rio-de-janeiro-estado", "Rio de Janeiro", TerritoryType.STATE, "Brasil", "Rio de Janeiro", undefined, -22.25, -42.66],
  ["rio-grande-do-sul", "Rio Grande do Sul", TerritoryType.STATE, "Brasil", "Rio Grande do Sul", undefined, -30.03, -51.22],
  ["minas-gerais", "Minas Gerais", TerritoryType.STATE, "Brasil", "Minas Gerais", undefined, -18.51, -44.56],
  ["bahia", "Bahia", TerritoryType.STATE, "Brasil", "Bahia", undefined, -12.57, -41.7],
  ["pernambuco", "Pernambuco", TerritoryType.STATE, "Brasil", "Pernambuco", undefined, -8.28, -35.07],
  ["distrito-federal", "Distrito Federal", TerritoryType.STATE, "Brasil", "Distrito Federal", undefined, -15.79, -47.88],
  ["curitiba-pr", "Curitiba", TerritoryType.CITY, "Brasil", "Paraná", "Curitiba", -25.43, -49.27],
  ["sao-jose-dos-pinhais-pr", "São José dos Pinhais", TerritoryType.CITY, "Brasil", "Paraná", "São José dos Pinhais", -25.53, -49.21],
  ["sao-paulo-sp", "São Paulo", TerritoryType.CITY, "Brasil", "São Paulo", "São Paulo", -23.55, -46.63],
  ["rio-de-janeiro-rj", "Rio de Janeiro", TerritoryType.CITY, "Brasil", "Rio de Janeiro", "Rio de Janeiro", -22.9, -43.2],
  ["porto-alegre-rs", "Porto Alegre", TerritoryType.CITY, "Brasil", "Rio Grande do Sul", "Porto Alegre", -30.03, -51.23],
  ["belo-horizonte-mg", "Belo Horizonte", TerritoryType.CITY, "Brasil", "Minas Gerais", "Belo Horizonte", -19.92, -43.94],
  ["salvador-ba", "Salvador", TerritoryType.CITY, "Brasil", "Bahia", "Salvador", -12.97, -38.5],
  ["recife-pe", "Recife", TerritoryType.CITY, "Brasil", "Pernambuco", "Recife", -8.05, -34.88],
  ["brasilia-df", "Brasília", TerritoryType.CITY, "Brasil", "Distrito Federal", "Brasília", -15.79, -47.88],
  ["buenos-aires-ar", "Buenos Aires", TerritoryType.CITY, "Argentina", undefined, "Buenos Aires", -34.6, -58.38],
  ["lisboa-pt", "Lisboa", TerritoryType.CITY, "Portugal", undefined, "Lisboa", 38.72, -9.14],
  ["nova-york-us", "Nova York", TerritoryType.CITY, "Estados Unidos", "New York", "Nova York", 40.71, -74.0],
  ["toquio-jp", "Tóquio", TerritoryType.CITY, "Japão", undefined, "Tóquio", 35.68, 139.69],
] as const;

const battles: Array<{
  territory: string;
  scores: Array<[string, number]>;
}> = [
  { territory: "global", scores: [["bruno-faria", 96000], ["yuki-tanaka", 94800], ["matheus-lima", 74000], ["ava-johnson", 65000], ["taina-moraes", 53000], ["ines-silva", 48000], ["sofia-almeida", 47000], ["bia-martins", 45500], ["noah-smith", 43000], ["lucas-gomez", 39000]] },
  { territory: "brasil", scores: [["bruno-faria", 90000], ["taina-moraes", 42000], ["matheus-lima", 36000], ["sofia-almeida", 35000], ["bia-martins", 34000]] },
  { territory: "argentina", scores: [["lucas-gomez", 22000], ["valentina-rios", 21800], ["martina-lopez", 12600]] },
  { territory: "portugal", scores: [["ines-silva", 30000], ["tiago-pereira", 12500], ["miguel-sousa", 11800]] },
  { territory: "estados-unidos", scores: [["ava-johnson", 35000], ["noah-smith", 34800], ["emily-brown", 9000]] },
  { territory: "japao", scores: [["yuki-tanaka", 41000], ["haruto-sato", 20500], ["sakura-mori", 19800]] },
  { territory: "parana", scores: [["taina-moraes", 42000], ["joao-pedro", 41800], ["matheus-lima", 25000], ["ana-kawa", 24400]] },
  { territory: "estado-de-sao-paulo", scores: [["bia-martins", 56000], ["caio-prado", 55700], ["paula-teixeira", 24000], ["bruno-faria", 20000]] },
  { territory: "rio-de-janeiro-estado", scores: [["maria-luiza", 36000], ["leo-santos", 23000], ["samuel-dias", 21000]] },
  { territory: "rio-grande-do-sul", scores: [["camila-rocha", 18000], ["beatriz-gomes", 17500], ["nina-ferraz", 9000]] },
  { territory: "minas-gerais", scores: [["rafa-nunes", 28000], ["enzo-moura", 12000], ["guilherme-reis", 11600]] },
  { territory: "bahia", scores: [["sofia-almeida", 22000], ["clara-mendes", 21600], ["igor-campos", 8000]] },
  { territory: "pernambuco", scores: [["davi-costa", 15000], ["marina-oliveira", 9000], ["pedro-cardoso", 8600]] },
  { territory: "distrito-federal", scores: [["livia-barros", 17000], ["helena-pires", 16550], ["isabela-cunha", 12000]] },
  { territory: "curitiba-pr", scores: [["matheus-lima", 18400], ["ana-kawa", 18100], ["renan-lopes", 12000], ["taina-moraes", 9000]] },
  { territory: "sao-jose-dos-pinhais-pr", scores: [["joao-pedro", 5000], ["vitor-assis", 4700]] },
  { territory: "sao-paulo-sp", scores: [["caio-prado", 26000], ["bia-martins", 25600], ["paula-teixeira", 9000], ["bruno-faria", 6000]] },
  { territory: "rio-de-janeiro-rj", scores: [["leo-santos", 20100], ["maria-luiza", 19850], ["samuel-dias", 7000]] },
  { territory: "porto-alegre-rs", scores: [["camila-rocha", 9600], ["beatriz-gomes", 9200], ["nina-ferraz", 8600]] },
  { territory: "belo-horizonte-mg", scores: [["guilherme-reis", 16000], ["enzo-moura", 7000], ["rafa-nunes", 6900]] },
  { territory: "salvador-ba", scores: [["sofia-almeida", 14000], ["igor-campos", 6200], ["clara-mendes", 5900]] },
  { territory: "recife-pe", scores: [["davi-costa", 11200], ["pedro-cardoso", 9000], ["marina-oliveira", 8800]] },
  { territory: "brasilia-df", scores: [["helena-pires", 9000], ["livia-barros", 8700], ["isabela-cunha", 8300]] },
  { territory: "buenos-aires-ar", scores: [["lucas-gomez", 12000], ["martina-lopez", 11800], ["valentina-rios", 7900]] },
  { territory: "lisboa-pt", scores: [["ines-silva", 14500], ["miguel-sousa", 13800], ["tiago-pereira", 13600]] },
  { territory: "nova-york-us", scores: [["ava-johnson", 25000], ["noah-smith", 24900], ["emily-brown", 7000]] },
  { territory: "toquio-jp", scores: [["yuki-tanaka", 18500], ["sakura-mori", 9400], ["haruto-sato", 9100]] },
];

const resolveStatus = (scores: Array<{ points: number }>) => {
  if (scores.length === 0) return TerritoryStatus.NONE;
  if (scores.length === 1) return TerritoryStatus.ACTIVE;
  const [first, second] = [...scores].sort((a, b) => b.points - a.points);
  if (first.points > second.points * 2) return TerritoryStatus.DOMINATED;
  if (first.points - second.points <= 500) return TerritoryStatus.WAR;
  return TerritoryStatus.COMPETITIVE;
};

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000);

async function main() {
  await prisma.payment.deleteMany();
  await prisma.territoryScore.deleteMany();
  await prisma.rankEvent.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.bannedWord.deleteMany();
  await prisma.territory.deleteMany();
  await prisma.user.deleteMany();

  await prisma.bannedWord.createMany({
    data: bannedWords.map((word) => ({ word })),
  });

  const createdUsers = await Promise.all(
    users.map(([publicName, city, state, country, message], index) =>
      prisma.user.create({
        data: {
          publicName,
          slug: slugify(publicName),
          message,
          city,
          state,
          country,
          createdAt: minutesAgo(1600 - index * 7),
        },
      }),
    ),
  );

  const createdTerritories = await Promise.all(
    territories.map(([slug, name, type, country, state, city, latitude, longitude], index) =>
      prisma.territory.create({
        data: {
          slug,
          name,
          type,
          country,
          state,
          city,
          latitude,
          longitude,
          createdAt: minutesAgo(1500 - index * 5),
        },
      }),
    ),
  );

  const userBySlug = new Map(createdUsers.map((user) => [user.slug, user]));
  const territoryBySlug = new Map(createdTerritories.map((territory) => [territory.slug, territory]));
  const totalsByUser = new Map<string, { points: number; amountCents: number }>();
  const totalsByTerritory = new Map<string, Array<{ userId: string; points: number; amountCents: number }>>();

  for (const battle of battles) {
    const territory = territoryBySlug.get(battle.territory);
    if (!territory) throw new Error(`Missing territory ${battle.territory}`);

    for (const [userSlug, points] of battle.scores) {
      const user = userBySlug.get(userSlug);
      if (!user) throw new Error(`Missing user ${userSlug}`);

      const amountCents = points;
      await prisma.territoryScore.create({
        data: {
          userId: user.id,
          territoryId: territory.id,
          points,
          amountCents,
          createdAt: minutesAgo(1300 - (points % 900)),
        },
      });

      await prisma.payment.create({
        data: {
          userId: user.id,
          territoryId: territory.id,
          provider: PaymentProvider.MERCADOPAGO,
          providerPaymentId: `seed_${battle.territory}_${userSlug}`,
          amountCents,
          points,
          status: PaymentStatus.APPROVED,
          approvedAt: minutesAgo(1200 - (points % 800)),
          pixCopyPaste: "seed-approved-payment",
          pixQrCode: "seed-approved-payment",
        },
      });

      const userTotals = totalsByUser.get(user.id) ?? { points: 0, amountCents: 0 };
      userTotals.points += points;
      userTotals.amountCents += amountCents;
      totalsByUser.set(user.id, userTotals);

      const scores = totalsByTerritory.get(territory.id) ?? [];
      scores.push({ userId: user.id, points, amountCents });
      totalsByTerritory.set(territory.id, scores);
    }
  }

  for (const [userId, totals] of totalsByUser.entries()) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalPoints: totals.points,
        totalPaidCents: totals.amountCents,
      },
    });
  }

  for (const territory of createdTerritories) {
    const scores = totalsByTerritory.get(territory.id) ?? [];
    const sorted = [...scores].sort((a, b) => b.points - a.points);
    await prisma.territory.update({
      where: { id: territory.id },
      data: {
        ownerId: sorted[0]?.userId,
        totalPoints: scores.reduce((sum, score) => sum + score.points, 0),
        totalAmountCents: scores.reduce((sum, score) => sum + score.amountCents, 0),
        status: resolveStatus(scores),
      },
    });
  }

  const territory = (slug: string) => territoryBySlug.get(slug);
  const user = (slug: string) => userBySlug.get(slug);

  await prisma.rankEvent.createMany({
    data: [
      { type: RankEventType.WAR_STARTED, territoryId: territory("curitiba-pr")?.id, userId: user("ana-kawa")?.id, text: "Curitiba entrou em guerra: faltam só 300 pontos para virar Prefeito.", country: "Brasil", state: "Paraná", city: "Curitiba", createdAt: minutesAgo(4) },
      { type: RankEventType.TERRITORY_TAKEN, territoryId: territory("parana")?.id, userId: user("taina-moraes")?.id, text: "O Paraná acabou de trocar de dono. Tainá virou Governadora.", country: "Brasil", state: "Paraná", createdAt: minutesAgo(9) },
      { type: RankEventType.USER_PASSED, territoryId: territory("sao-paulo-sp")?.id, userId: user("caio-prado")?.id, text: "Caio passou Bia por 400 pontos em São Paulo.", country: "Brasil", state: "São Paulo", city: "São Paulo", createdAt: minutesAgo(13) },
      { type: RankEventType.WAR_STARTED, territoryId: territory("nova-york-us")?.id, userId: user("noah-smith")?.id, text: "Nova York está em guerra. Noah está a R$1,00 do topo.", country: "Estados Unidos", state: "New York", city: "Nova York", createdAt: minutesAgo(16) },
      { type: RankEventType.PAYMENT_APPROVED, territoryId: territory("brasil")?.id, userId: user("bruno-faria")?.id, text: "Bruno confirmou Pix e abriu vantagem pelo Brasil.", country: "Brasil", createdAt: minutesAgo(22) },
      { type: RankEventType.TOP_10_ENTERED, territoryId: territory("global")?.id, userId: user("lucas-gomez")?.id, text: "Lucas entrou no top 10 global.", country: "Argentina", city: "Buenos Aires", createdAt: minutesAgo(28) },
      { type: RankEventType.WAR_STARTED, territoryId: territory("buenos-aires-ar")?.id, userId: user("martina-lopez")?.id, text: "Buenos Aires está separada por 200 pontos.", country: "Argentina", city: "Buenos Aires", createdAt: minutesAgo(34) },
      { type: RankEventType.TERRITORY_TAKEN, territoryId: territory("toquio-jp")?.id, userId: user("yuki-tanaka")?.id, text: "Yuki consolidou Tóquio com 18.500 pontos.", country: "Japão", city: "Tóquio", createdAt: minutesAgo(39) },
      { type: RankEventType.PAYMENT_APPROVED, territoryId: territory("sao-jose-dos-pinhais-pr")?.id, userId: user("vitor-assis")?.id, text: "Vitor colocou São José dos Pinhais a R$3,00 da virada.", country: "Brasil", state: "Paraná", city: "São José dos Pinhais", createdAt: minutesAgo(45) },
      { type: RankEventType.WAR_STARTED, territoryId: territory("distrito-federal")?.id, userId: user("helena-pires")?.id, text: "Distrito Federal virou disputa aberta.", country: "Brasil", state: "Distrito Federal", createdAt: minutesAgo(52) },
      { type: RankEventType.TERRITORY_TAKEN, territoryId: territory("portugal")?.id, userId: user("ines-silva")?.id, text: "Inês manteve Portugal dominado.", country: "Portugal", createdAt: minutesAgo(61) },
      { type: RankEventType.USER_PASSED, territoryId: territory("rio-de-janeiro-rj")?.id, userId: user("leo-santos")?.id, text: "Leo retomou o Rio de Janeiro por 250 pontos.", country: "Brasil", state: "Rio de Janeiro", city: "Rio de Janeiro", createdAt: minutesAgo(75) },
    ],
  });

  await prisma.auditLog.create({
    data: {
      action: "seed.completed",
      actor: "seed",
      metadata: {
        users: createdUsers.length,
        territories: createdTerritories.length,
        payments: battles.reduce((sum, battle) => sum + battle.scores.length, 0),
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
