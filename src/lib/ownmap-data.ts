export type OwnMapStatus = "empty" | "active" | "contested" | "dominated" | "war";
export type OwnMapTerritoryType = "country" | "state" | "city";
export type OwnMapMode = "dispute" | "revenue" | "war" | "opportunity" | "owners";

export type OwnerProfile = {
  name: string;
  title: string;
  customTitle: string;
  avatarUrl: string;
  message: string;
  accent: string;
  emblem: string;
  socialHandle: string;
};

export type OwnMapRank = {
  name: string;
  points: number;
  avatarUrl: string;
  message?: string;
};

export type OwnMapTerritory = {
  id: string;
  slug: string;
  name: string;
  type: OwnMapTerritoryType;
  status: OwnMapStatus;
  country?: string;
  state?: string;
  city?: string;
  iso?: string;
  stateCode?: string;
  latitude?: number;
  longitude?: number;
  owner?: OwnerProfile;
  bannerUrl: string;
  aliases?: string[];
  points: number;
  ownerPoints: number;
  totalCents: number;
  gapPoints: number;
  heat: number;
  featured?: boolean;
  ranking: OwnMapRank[];
  events: string[];
  neighbors: string[];
};

const banner = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;
const avatar = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=160&h=160&q=80`;

export const owners: Record<string, OwnerProfile> = {
  matheus: {
    name: "Matheus Lima",
    title: "Prefeito de Curitiba",
    customTitle: "Dono do Frio",
    avatarUrl: avatar("photo-1500648767791-00dcc994a43e"),
    message: "Curitiba e nossa, quero ver tomar.",
    accent: "#d6a83a",
    emblem: "Rosa dos Ventos",
    socialHandle: "@matheusdomapa",
  },
  ana: {
    name: "Ana Kawa",
    title: "Prefeita de Sao Paulo",
    customTitle: "Capital Acordada",
    avatarUrl: avatar("photo-1494790108377-be9c29b29330"),
    message: "A capital nao dorme. Cada ponto aqui pesa.",
    accent: "#22c55e",
    emblem: "Capital Acordada",
    socialHandle: "@anakawa",
  },
  lucas: {
    name: "Lucas Faria",
    title: "Presidente do Brasil",
    customTitle: "Soberano do Verde",
    avatarUrl: avatar("photo-1506794778202-cad84cf45f1d"),
    message: "O mapa comeca aqui.",
    accent: "#f2c45b",
    emblem: "Brasil no Topo",
    socialHandle: "@lucasfaria",
  },
  bia: {
    name: "Bia Martins",
    title: "Governadora do Parana",
    customTitle: "Sul em Guerra",
    avatarUrl: avatar("photo-1534528741775-53994a69daeb"),
    message: "O sul entrou no jogo antes de todo mundo.",
    accent: "#fb923c",
    emblem: "Sul em Guerra",
    socialHandle: "@biamartins",
  },
  sofia: {
    name: "Sofia Almeida",
    title: "Rainha de Lisboa",
    customTitle: "Atlantico Azul",
    avatarUrl: avatar("photo-1524504388940-b1c1722653e1"),
    message: "Lisboa lidera com classe.",
    accent: "#38bdf8",
    socialHandle: "@sofiaalmeida",
    emblem: "Atlantico",
  },
  yuki: {
    name: "Yuki Tanaka",
    title: "Guardiao de Toquio",
    customTitle: "Neon District",
    avatarUrl: avatar("photo-1507003211169-0a1dd7228f2d"),
    message: "Tokyo never sleeps.",
    accent: "#f43f5e",
    emblem: "Neon District",
    socialHandle: "@yukitanaka",
  },
  ava: {
    name: "Ava Johnson",
    title: "Mayor of New York",
    customTitle: "Skyline Holder",
    avatarUrl: avatar("photo-1544005313-94ddf0286df2"),
    message: "The skyline belongs to whoever moves first.",
    accent: "#60a5fa",
    emblem: "Skyline",
    socialHandle: "@avaownsny",
  },
  martin: {
    name: "Martin Rios",
    title: "Lider de Buenos Aires",
    customTitle: "Rio Plate",
    avatarUrl: avatar("photo-1506794778202-cad84cf45f1d"),
    message: "La ciudad esta viva.",
    accent: "#34d399",
    emblem: "Rio Plate",
    socialHandle: "@martinrios",
  },
};

const statusFromSeed = (seed: number): OwnMapStatus => {
  if (seed % 29 === 0) return "war";
  if (seed % 17 === 0) return "dominated";
  if (seed % 11 === 0) return "contested";
  if (seed % 7 === 0) return "active";
  return "empty";
};

export const slugifyOwnMap = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export const statusLabels: Record<OwnMapStatus, string> = {
  empty: "Sem dono",
  active: "Ativo",
  contested: "Disputado",
  dominated: "Dominado",
  war: "Guerra ativa",
};

export const typeLabels: Record<OwnMapTerritoryType, string> = {
  country: "Pais",
  state: "Estado",
  city: "Cidade",
};

export const modeLabels: Record<OwnMapMode, string> = {
  dispute: "Disputa",
  revenue: "Arrecadacao",
  war: "Guerra",
  opportunity: "Oportunidade",
  owners: "Donos",
};

export const countryNameOverrides: Record<string, string> = {
  "032": "Argentina",
  "076": "Brasil",
  "124": "Canada",
  "152": "Chile",
  "156": "China",
  "250": "Franca",
  "276": "Alemanha",
  "380": "Italia",
  "392": "Japao",
  "410": "Coreia do Sul",
  "484": "Mexico",
  "528": "Paises Baixos",
  "620": "Portugal",
  "724": "Espanha",
  "784": "Emirados Arabes Unidos",
  "826": "Reino Unido",
  "840": "Estados Unidos",
  "858": "Uruguai",
};

export const countryOverrides: Record<string, Partial<OwnMapTerritory>> = {
  "076": {
    slug: "brasil",
    status: "dominated",
    owner: owners.lucas,
    bannerUrl: banner("photo-1483729558449-99ef09a8c325"),
    points: 482000,
    ownerPoints: 214000,
    totalCents: 482000,
    gapPoints: 9200,
    heat: 95,
    featured: true,
    events: ["Brasil consolidou dominio nacional.", "Parana puxou nova guerra regional."],
    neighbors: ["Argentina", "Uruguai", "Chile"],
  },
  "840": {
    slug: "estados-unidos",
    status: "war",
    owner: owners.ava,
    bannerUrl: banner("photo-1499092346589-b9b6be3e94b2"),
    points: 331200,
    ownerPoints: 120400,
    totalCents: 331200,
    gapPoints: 300,
    heat: 89,
    featured: true,
    events: ["Nova York encostou em Los Angeles.", "Miami entrou no top 5."],
    neighbors: ["Canada", "Mexico"],
  },
  "032": {
    slug: "argentina",
    status: "contested",
    owner: owners.martin,
    bannerUrl: banner("photo-1589909202802-8f4aadce1849"),
    points: 156800,
    ownerPoints: 64000,
    totalCents: 156800,
    gapPoints: 800,
    heat: 68,
    featured: true,
    events: ["Buenos Aires abriu vantagem curta.", "Cordoba ficou barata para tomar."],
    neighbors: ["Brasil", "Chile", "Uruguai"],
  },
  "620": {
    slug: "portugal",
    status: "dominated",
    owner: owners.sofia,
    bannerUrl: banner("photo-1555881400-74d7acaacd8b"),
    points: 129400,
    ownerPoints: 86000,
    totalCents: 129400,
    gapPoints: 12700,
    heat: 58,
    featured: true,
    events: ["Lisboa manteve o topo.", "Porto chegou ao podio nacional."],
    neighbors: ["Espanha", "Franca"],
  },
  "392": {
    slug: "japao",
    status: "contested",
    owner: owners.yuki,
    bannerUrl: banner("photo-1540959733332-eab4deabeeaf"),
    points: 208700,
    ownerPoints: 91500,
    totalCents: 208700,
    gapPoints: 1100,
    heat: 78,
    featured: true,
    events: ["Toquio ganhou nova personalizacao.", "Osaka entrou em oportunidade."],
    neighbors: ["Coreia do Sul", "China"],
  },
  "250": {
    slug: "franca",
    status: "active",
    bannerUrl: banner("photo-1502602898657-3e91760cbb34"),
    points: 71200,
    ownerPoints: 33000,
    totalCents: 71200,
    gapPoints: 3400,
    heat: 42,
    featured: true,
  },
  "826": {
    slug: "reino-unido",
    status: "active",
    bannerUrl: banner("photo-1513635269975-59663e0ac1ad"),
    points: 83000,
    ownerPoints: 41000,
    totalCents: 83000,
    gapPoints: 2500,
    heat: 47,
    featured: true,
  },
  "724": {
    slug: "espanha",
    status: "contested",
    bannerUrl: banner("photo-1539037116277-4db20889f2d4"),
    points: 97400,
    ownerPoints: 50100,
    totalCents: 97400,
    gapPoints: 700,
    heat: 51,
    featured: true,
  },
  "858": {
    slug: "uruguai",
    status: "active",
    bannerUrl: banner("photo-1598284680103-a2f7f9c74b55"),
    points: 24200,
    ownerPoints: 13200,
    totalCents: 24200,
    gapPoints: 1200,
    heat: 30,
    featured: true,
  },
};

const featuredCountryNames: Record<string, string> = {
  "032": "Argentina",
  "076": "Brasil",
  "250": "Franca",
  "392": "Japao",
  "620": "Portugal",
  "724": "Espanha",
  "826": "Reino Unido",
  "840": "Estados Unidos",
  "858": "Uruguai",
};

export const brazilStates: OwnMapTerritory[] = [
  ["11", "RO", "Rondonia", -10.83, -63.34],
  ["12", "AC", "Acre", -9.02, -70.81],
  ["13", "AM", "Amazonas", -3.47, -65.1],
  ["14", "RR", "Roraima", 2.05, -61.4],
  ["15", "PA", "Para", -3.79, -52.48],
  ["16", "AP", "Amapa", 1.41, -51.77],
  ["17", "TO", "Tocantins", -10.25, -48.25],
  ["21", "MA", "Maranhao", -5.42, -45.44],
  ["22", "PI", "Piaui", -7.72, -42.73],
  ["23", "CE", "Ceara", -5.2, -39.53],
  ["24", "RN", "Rio Grande do Norte", -5.81, -36.59],
  ["25", "PB", "Paraiba", -7.28, -36.72],
  ["26", "PE", "Pernambuco", -8.28, -35.07],
  ["27", "AL", "Alagoas", -9.62, -36.82],
  ["28", "SE", "Sergipe", -10.57, -37.45],
  ["29", "BA", "Bahia", -12.57, -41.7],
  ["31", "MG", "Minas Gerais", -18.51, -44.56],
  ["32", "ES", "Espirito Santo", -19.19, -40.34],
  ["33", "RJ", "Rio de Janeiro", -22.25, -42.66],
  ["35", "SP", "Sao Paulo", -22.19, -48.79],
  ["41", "PR", "Parana", -24.89, -51.55],
  ["42", "SC", "Santa Catarina", -27.33, -49.44],
  ["43", "RS", "Rio Grande do Sul", -30.03, -51.22],
  ["50", "MS", "Mato Grosso do Sul", -20.51, -54.54],
  ["51", "MT", "Mato Grosso", -12.64, -55.42],
  ["52", "GO", "Goias", -15.98, -49.86],
  ["53", "DF", "Distrito Federal", -15.79, -47.88],
].map(([code, uf, name, latitude, longitude], index) => {
  const featured: Record<string, Partial<OwnMapTerritory>> = {
    PR: {
      status: "war",
      owner: owners.bia,
      points: 133200,
      ownerPoints: 42000,
      totalCents: 133200,
      gapPoints: 300,
      heat: 84,
      events: ["Parana esta separado por 300 pontos.", "Curitiba acendeu a disputa."],
    },
    SP: {
      status: "war",
      owner: owners.ana,
      points: 155700,
      ownerPoints: 56000,
      totalCents: 155700,
      gapPoints: 500,
      heat: 91,
      events: ["Sao Paulo esta em guerra.", "Campinas chegou forte no interior."],
    },
    RJ: { status: "contested", points: 80000, ownerPoints: 36000, totalCents: 80000, gapPoints: 900, heat: 61 },
    RS: { status: "war", points: 44500, ownerPoints: 18000, totalCents: 44500, gapPoints: 500, heat: 57 },
    MG: { status: "dominated", points: 51600, ownerPoints: 28000, totalCents: 51600, gapPoints: 9000, heat: 49 },
    BA: { status: "war", points: 51600, ownerPoints: 22000, totalCents: 51600, gapPoints: 400, heat: 54 },
    PE: { status: "contested", points: 32600, ownerPoints: 15000, totalCents: 32600, gapPoints: 600, heat: 46 },
    DF: { status: "war", points: 45550, ownerPoints: 17000, totalCents: 45550, gapPoints: 450, heat: 52 },
  };
  const override = featured[String(uf)] ?? {};
  const status = override.status ?? statusFromSeed(index + 9);
  const nameText = String(name);
  return {
    id: `state-${uf}`,
    slug: slugifyOwnMap(nameText),
    name: nameText,
    type: "state",
    country: "Brasil",
    state: nameText,
    stateCode: String(code),
    latitude: Number(latitude),
    longitude: Number(longitude),
    status,
    owner: override.owner,
    bannerUrl: "",
    points: override.points ?? (status === "empty" ? 0 : 12000 + index * 2100),
    ownerPoints: override.ownerPoints ?? (status === "empty" ? 0 : 6000 + index * 700),
    totalCents: override.totalCents ?? (status === "empty" ? 0 : 12000 + index * 2100),
    gapPoints: override.gapPoints ?? (status === "empty" ? 100 : 900 + (index % 7) * 320),
    heat: override.heat ?? (status === "empty" ? 6 : 24 + (index % 10) * 5),
    featured: Boolean(featured[String(uf)]),
    ranking: makeRanking(override.owner, status, index),
    events: override.events ?? [`${nameText} entrou no radar regional.`, `Nova disputa aberta em ${nameText}.`],
    neighbors: [],
  };
});

export const cityTerritories: OwnMapTerritory[] = [
  ["Curitiba", "Brasil", "Parana", -25.43, -49.27, "war", owners.matheus, 57500, 18400, 400, "photo-1518005020951-eccb494ad742"],
  ["Sao Jose dos Pinhais", "Brasil", "Parana", -25.53, -49.21, "war", undefined, 9700, 5000, 300, "photo-1518005020951-eccb494ad742"],
  ["Londrina", "Brasil", "Parana", -23.31, -51.16, "active", undefined, 12200, 6500, 700, "photo-1483729558449-99ef09a8c325"],
  ["Maringa", "Brasil", "Parana", -23.42, -51.93, "contested", undefined, 15400, 8000, 500, "photo-1483729558449-99ef09a8c325"],
  ["Ponta Grossa", "Brasil", "Parana", -25.09, -50.16, "empty", undefined, 0, 0, 100, ""],
  ["Cascavel", "Brasil", "Parana", -24.96, -53.46, "active", undefined, 9300, 4800, 650, ""],
  ["Foz do Iguacu", "Brasil", "Parana", -25.54, -54.59, "contested", undefined, 14900, 7600, 450, ""],
  ["Sao Paulo", "Brasil", "Sao Paulo", -23.55, -46.63, "contested", owners.ana, 66600, 26000, 500, "photo-1543059080-f9b1272213d5"],
  ["Campinas", "Brasil", "Sao Paulo", -22.9, -47.06, "active", undefined, 19000, 9400, 1200, "photo-1543059080-f9b1272213d5"],
  ["Santos", "Brasil", "Sao Paulo", -23.96, -46.33, "empty", undefined, 0, 0, 100, "photo-1507525428034-b723cf961d3e"],
  ["Guarulhos", "Brasil", "Sao Paulo", -23.45, -46.53, "active", undefined, 12600, 5900, 780, ""],
  ["Rio de Janeiro", "Brasil", "Rio de Janeiro", -22.9, -43.2, "war", undefined, 46950, 20100, 250, "photo-1483729558449-99ef09a8c325"],
  ["Niteroi", "Brasil", "Rio de Janeiro", -22.88, -43.1, "active", undefined, 8200, 5000, 900, "photo-1483729558449-99ef09a8c325"],
  ["Belo Horizonte", "Brasil", "Minas Gerais", -19.92, -43.94, "dominated", undefined, 29900, 16000, 7000, "photo-1519985176271-adb1088fa94c"],
  ["Contagem", "Brasil", "Minas Gerais", -19.93, -44.05, "empty", undefined, 0, 0, 100, "photo-1519985176271-adb1088fa94c"],
  ["Porto Alegre", "Brasil", "Rio Grande do Sul", -30.03, -51.23, "war", undefined, 27400, 9600, 400, "photo-1518005020951-eccb494ad742"],
  ["Caxias do Sul", "Brasil", "Rio Grande do Sul", -29.17, -51.18, "active", undefined, 11200, 5700, 800, "photo-1518005020951-eccb494ad742"],
  ["Florianopolis", "Brasil", "Santa Catarina", -27.59, -48.55, "contested", undefined, 18000, 9000, 600, "photo-1507525428034-b723cf961d3e"],
  ["Joinville", "Brasil", "Santa Catarina", -26.3, -48.85, "active", undefined, 10400, 5200, 900, "photo-1483729558449-99ef09a8c325"],
  ["Salvador", "Brasil", "Bahia", -12.97, -38.5, "dominated", undefined, 26100, 14000, 6200, "photo-1507525428034-b723cf961d3e"],
  ["Recife", "Brasil", "Pernambuco", -8.05, -34.88, "contested", undefined, 29000, 11200, 900, "photo-1507525428034-b723cf961d3e"],
  ["Fortaleza", "Brasil", "Ceara", -3.73, -38.52, "active", undefined, 17800, 9400, 1400, "photo-1507525428034-b723cf961d3e"],
  ["Brasilia", "Brasil", "Distrito Federal", -15.79, -47.88, "war", undefined, 26000, 9000, 300, "photo-1500530855697-b586d89ba3ee"],
  ["Goiania", "Brasil", "Goias", -16.68, -49.25, "active", undefined, 8900, 4200, 700, "photo-1500530855697-b586d89ba3ee"],
  ["Manaus", "Brasil", "Amazonas", -3.1, -60.02, "active", undefined, 11200, 6100, 1100, "photo-1516426122078-c23e76319801"],
  ["Belem", "Brasil", "Para", -1.45, -48.5, "empty", undefined, 0, 0, 100, "photo-1516426122078-c23e76319801"],
  ["Vitoria", "Brasil", "Espirito Santo", -20.32, -40.34, "active", undefined, 9800, 4900, 800, "photo-1507525428034-b723cf961d3e"],
  ["Cuiaba", "Brasil", "Mato Grosso", -15.6, -56.1, "empty", undefined, 0, 0, 100, "photo-1500530855697-b586d89ba3ee"],
  ["Campo Grande", "Brasil", "Mato Grosso do Sul", -20.47, -54.62, "active", undefined, 7400, 3800, 700, "photo-1500530855697-b586d89ba3ee"],
  ["Buenos Aires", "Argentina", undefined, -34.6, -58.38, "war", owners.martin, 31700, 12000, 200, "photo-1589909202802-8f4aadce1849"],
  ["Cordoba", "Argentina", undefined, -31.42, -64.18, "active", undefined, 9400, 4400, 800, "photo-1589909202802-8f4aadce1849"],
  ["Montevideo", "Uruguai", undefined, -34.9, -56.16, "active", undefined, 7800, 3900, 600, "photo-1598284680103-a2f7f9c74b55"],
  ["Santiago", "Chile", undefined, -33.45, -70.66, "contested", undefined, 14500, 6900, 500, "photo-1478827387698-1527781a4887"],
  ["Lisboa", "Portugal", undefined, 38.72, -9.14, "contested", owners.sofia, 41900, 14500, 700, "photo-1555881400-74d7acaacd8b"],
  ["Porto", "Portugal", undefined, 41.15, -8.61, "active", undefined, 12700, 6200, 900, "photo-1555881400-74d7acaacd8b"],
  ["Madrid", "Espanha", undefined, 40.42, -3.7, "active", undefined, 18400, 9400, 1200, "photo-1539037116277-4db20889f2d4"],
  ["Barcelona", "Espanha", undefined, 41.38, 2.17, "war", undefined, 22100, 10800, 300, "photo-1539037116277-4db20889f2d4"],
  ["Paris", "Franca", undefined, 48.85, 2.35, "active", undefined, 24300, 12800, 1400, "photo-1502602898657-3e91760cbb34"],
  ["Londres", "Reino Unido", undefined, 51.51, -0.13, "contested", undefined, 29500, 14000, 900, "photo-1513635269975-59663e0ac1ad"],
  ["Berlin", "Alemanha", undefined, 52.52, 13.4, "active", undefined, 21400, 10200, 850, ""],
  ["Rome", "Italia", undefined, 41.9, 12.5, "contested", undefined, 18900, 9400, 620, ""],
  ["Amsterdam", "Paises Baixos", undefined, 52.37, 4.9, "active", undefined, 13200, 6800, 900, ""],
  ["New York", "Estados Unidos", "New York", 40.71, -74, "war", owners.ava, 56900, 25000, 200, "photo-1499092346589-b9b6be3e94b2", ["Nova York", "NYC"]],
  ["Miami", "Estados Unidos", "Florida", 25.76, -80.19, "active", undefined, 14800, 7300, 900, "photo-1507525428034-b723cf961d3e"],
  ["Los Angeles", "Estados Unidos", "California", 34.05, -118.24, "contested", undefined, 40500, 19800, 1000, "photo-1500530855697-b586d89ba3ee"],
  ["Chicago", "Estados Unidos", "Illinois", 41.88, -87.63, "active", undefined, 17100, 8300, 760, ""],
  ["Tokyo", "Japao", undefined, 35.68, 139.69, "contested", owners.yuki, 37000, 18500, 1100, "photo-1540959733332-eab4deabeeaf", ["Toquio", "Tokio"]],
  ["Seoul", "Coreia do Sul", undefined, 37.57, 126.98, "war", undefined, 24600, 11900, 280, ""],
  ["Beijing", "China", undefined, 39.9, 116.41, "active", undefined, 23100, 11200, 980, ""],
  ["Shanghai", "China", undefined, 31.23, 121.47, "contested", undefined, 28700, 13400, 640, ""],
  ["Dubai", "Emirados Arabes Unidos", undefined, 25.2, 55.27, "dominated", undefined, 31900, 18500, 4200, ""],
  ["Mexico City", "Mexico", undefined, 19.43, -99.13, "war", undefined, 26500, 12900, 300, "", ["Cidade do Mexico"]],
].map(([name, country, state, latitude, longitude, status, owner, points, ownerPoints, gapPoints, bannerId, aliases], index) => {
  const nameText = String(name);
  const countryText = String(country);
  const stateText = state ? String(state) : undefined;
  const aliasList = Array.isArray(aliases) ? aliases.map(String) : [];
  return {
    id: `city-${slugifyOwnMap(`${nameText}-${countryText}`)}`,
    slug: slugifyOwnMap(`${nameText}-${stateText ?? countryText}`),
    name: nameText,
    type: "city",
    country: countryText,
    state: stateText,
    city: nameText,
    latitude: Number(latitude),
    longitude: Number(longitude),
    status: status as OwnMapStatus,
    owner: owner as OwnerProfile | undefined,
    bannerUrl: bannerId ? banner(String(bannerId)) : "",
    aliases: aliasList,
    points: Number(points),
    ownerPoints: Number(ownerPoints),
    totalCents: Number(points),
    gapPoints: Number(gapPoints),
    heat: Math.min(100, Math.max(12, Math.round(Number(points) / 650))),
    featured: index < 14 || Boolean(owner),
    ranking: makeRanking(owner as OwnerProfile | undefined, status as OwnMapStatus, index),
    events: [
      `${nameText} recebeu uma nova tentativa de tomada.`,
      Number(gapPoints) <= 500 ? `${nameText} esta em guerra aberta.` : `${nameText} ficou mais visivel no mapa.`,
    ],
    neighbors: [],
  };
});

export function makeRanking(owner: OwnerProfile | undefined, status: OwnMapStatus, seed: number): OwnMapRank[] {
  const names = [
    "Ana Kawa",
    "Matheus Lima",
    "Renan Lopes",
    "Taina Moraes",
    "Pedro Souza",
    "Sofia Almeida",
    "Caio Prado",
    "Yuki Tanaka",
    "Ava Johnson",
    "Martin Rios",
    "Lia Campos",
    "Noah Silva",
    "Clara Moon",
    "Diego Ramos",
    "Maya Torres",
    "Rafa Nunes",
  ];
  const first = owner?.name ?? names[seed % names.length];
  const base = status === "empty" ? 0 : 18000 + seed * 930;
  return Array.from({ length: status === "empty" ? 0 : 12 }, (_, index) => ({
    name: index === 0 ? first : names[(seed + index) % names.length],
    points: Math.max(900, base - index * (status === "war" ? 350 : 2400)),
    message: index === 0 ? "Defendendo o topo." : index < 3 ? "Encostando no lider." : "Subindo no mapa.",
    avatarUrl: avatar(
      [
        "photo-1500648767791-00dcc994a43e",
        "photo-1494790108377-be9c29b29330",
        "photo-1534528741775-53994a69daeb",
        "photo-1507003211169-0a1dd7228f2d",
      ][index % 4],
    ),
  }));
}

export function getExpandedRanking(territory: OwnMapTerritory, limit = 100) {
  if (territory.status === "empty") return [];
  const seed = territory.slug.length + territory.name.length;
  const baseRows = territory.ranking.length ? territory.ranking : makeRanking(territory.owner, territory.status, seed);
  const names = [
    "Ana Kawa",
    "Matheus Lima",
    "Renan Lopes",
    "Taina Moraes",
    "Pedro Souza",
    "Sofia Almeida",
    "Caio Prado",
    "Yuki Tanaka",
    "Ava Johnson",
    "Martin Rios",
    "Lia Campos",
    "Noah Silva",
    "Clara Moon",
    "Diego Ramos",
    "Maya Torres",
    "Rafa Nunes",
    "Helena Costa",
    "Bruno Park",
    "Nina Duarte",
    "Leo Martins",
  ];
  const rows = Array.from({ length: limit }, (_, index) => {
    const source = baseRows[index % baseRows.length];
    const points = Math.max(100, (source?.points ?? territory.ownerPoints) - index * (territory.status === "war" ? 180 : 520));
    return {
      name: index === 0 && territory.owner ? territory.owner.name : source?.name ?? names[(seed + index) % names.length],
      points,
      avatarUrl: source?.avatarUrl ?? avatar("photo-1500648767791-00dcc994a43e"),
      message: source?.message ?? (index < 3 ? "Mirando o topo." : "Quer aparecer aqui."),
    };
  });
  return rows.sort((a, b) => b.points - a.points).slice(0, limit);
}

export function createCountryTerritory(iso: string, naturalName: string, index: number): OwnMapTerritory {
  const override = countryOverrides[iso];
  const name = countryNameOverrides[iso] ?? naturalName;
  const seed = Array.from(iso).reduce((sum, char) => sum + char.charCodeAt(0), index);
  const status = override?.status ?? statusFromSeed(seed);
  const hasOwner = status !== "empty" && seed % 3 === 0;
  const owner = override?.owner ?? (hasOwner ? Object.values(owners)[seed % Object.values(owners).length] : undefined);

  return {
    id: `country-${iso}-${slugifyOwnMap(name)}`,
    slug: override?.slug ?? slugifyOwnMap(name),
    name,
    type: "country",
    country: name,
    iso,
    status,
    owner,
    bannerUrl: override?.bannerUrl ?? banner("photo-1451187580459-43490279c0fa"),
    points: override?.points ?? (status === "empty" ? 0 : 8000 + (seed % 70) * 1200),
    ownerPoints: override?.ownerPoints ?? (status === "empty" ? 0 : 3000 + (seed % 30) * 800),
    totalCents: override?.totalCents ?? (status === "empty" ? 0 : 8000 + (seed % 70) * 1200),
    gapPoints: override?.gapPoints ?? (status === "empty" ? 100 : 300 + (seed % 18) * 350),
    heat: override?.heat ?? (status === "empty" ? 5 : 20 + (seed % 70)),
    featured: override?.featured ?? status !== "empty",
    ranking: override?.ranking ?? makeRanking(owner, status, seed),
    events: override?.events ?? [`${name} apareceu na exploracao global.`, status === "war" ? `${name} entrou em guerra.` : `${name} segue aberto para disputa.`],
    neighbors: override?.neighbors ?? [],
  };
}

export const allStaticTerritories = [...brazilStates, ...cityTerritories];

export const featuredCountryTerritories = Object.entries(featuredCountryNames).map(([iso, name], index) =>
  createCountryTerritory(iso, name, index),
);

export function getStaticTerritoryBySlug(slug: string) {
  return allStaticTerritories.find((territory) => territory.slug === slug);
}

export function getOwnMapTerritoryBySlug(slug: string) {
  return [...featuredCountryTerritories, ...allStaticTerritories].find((territory) => territory.slug === slug);
}

export function getOwnMapTerritoriesForStaticPages() {
  return [...featuredCountryTerritories, ...allStaticTerritories].sort((a, b) => b.points - a.points);
}

export function titleForOwnMapTerritory(territory: OwnMapTerritory) {
  if (territory.type === "city") return `Prefeito de ${territory.name}`;
  if (territory.type === "state") return `Governador de ${territory.name}`;
  return `Presidente de ${territory.name}`;
}

export function formatOwnMapPoints(points: number) {
  return new Intl.NumberFormat("pt-BR").format(points);
}

export function formatOwnMapCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}
