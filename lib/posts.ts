import { BlogPost, HomeContent } from "./types";
import { adminDb } from "./firebase-admin";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";

export const DEFAULT_POSTS: BlogPost[] = [
  {
    id: "post-1",
    title: "Compromisso com a Saúde nos Municípios do Interior",
    slug: "compromisso-com-a-saude-nos-municipios-do-interior",
    summary:
      "Apresentamos propostas para fortalecer o atendimento médico especializado nas calhas dos rios e reduzir as filas de espera na capital.",
    content: `A saúde da população do interior do Amazonas não pode depender exclusivamente de viagens de horas ou dias até Manaus. Nossa trajetória na gestão pública nos mostrou de perto a realidade das famílias ribeirinhas e dos municípios vizinhos.

Na Assembleia Legislativa do Amazonas (ALEAM), nossa prioridade será articular e destinar emendas impositivas para reforçar os polos regionais de saúde, garantir medicamentos básicos nos postos municipais e valorizar os agentes comunitários de saúde e de endemias.

Seguimos firmes ouvindo os anseios de cada comunidade para construir soluções viáveis e permanentes.`,
    coverImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80",
    category: "Saúde",
    publishedAt: "2026-09-20",
    likes: 42,
    featured: true,
    status: "published",
    updatedAt: "2026-09-20T10:00:00Z",
  },
  {
    id: "post-2",
    title: "Apoio ao Produtor Rural e ao Escoamento da Produção",
    slug: "apoio-ao-produtor-rural-e-ao-escoamento-da-producao",
    summary:
      "O setor primário é o coração da nossa economia no Amazonas. Conheça as diretrizes para estradas vicinais e incentivo à agricultura familiar.",
    content: `Quem produz o alimento que chega à mesa das famílias amazonenses precisa de respeito, incentivo técnico e estradas vicinais trafegáveis o ano inteiro.

Em nossas conversas com feirantes, cooperativas e produtores rurais, reforçamos que a agricultura familiar sustentável precisa de linhas de crédito facilitadas e menor burocracia para emissão de certidões.

Nosso mandato atuará lado a lado com as associações de produtores para defender investimentos contínuos em infraestrutura de escoamento e assistência técnica no campo.`,
    coverImage: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&q=80",
    category: "Agricultura & Economia",
    publishedAt: "2026-09-18",
    likes: 29,
    featured: false,
    status: "published",
    updatedAt: "2026-09-18T14:30:00Z",
  },
  {
    id: "post-3",
    title: "Capacitação e Oportunidades para a Juventude Amazonense",
    slug: "capacitacao-e-oportunidades-para-a-juventude-amazonense",
    summary:
      "Cursos profissionalizantes conectados à bioeconomia, tecnologia e primeiro emprego são essenciais para transformar o futuro dos nossos jovens.",
    content: `Os jovens do Amazonas têm talento, energia e vontade de vencer, mas faltam oportunidades concretas de primeiro emprego e cursos profissionalizantes de qualidade, principalmente fora da capital.

Defendemos a ampliação de centros tecnológicos integrados, parcerias com o setor produtivo e incentivo à economia verde e bioeconomia local.

Com qualificação certa, os nossos jovens poderão empreender e construir sua carreira no seu próprio município com dignidade e renda digna.`,
    coverImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80",
    category: "Juventude & Emprego",
    publishedAt: "2026-09-15",
    likes: 38,
    featured: false,
    status: "published",
    updatedAt: "2026-09-15T09:00:00Z",
  },
];

export const DEFAULT_HOME_CONTENT: HomeContent = {
  heroTagline: "CORAGEM PARA FAZER. EXPERIÊNCIA PARA AVANÇAR.",
  heroSubtitle:
    "Com histórico comprovado de trabalho e dedicação pelo interior e pela capital, João Roberto coloca sua experiência a serviço de todo o Amazonas na Assembleia Legislativa.",
  aboutHighlight:
    "Ex-vice-prefeito de Manacapuru, com atuação reconhecida na saúde, infraestrutura e apoio aos produtores locais.",
  twibbonUrl: "https://www.twibbonize.com/joaoroberto70111depestadual",
  updatedAt: "2026-09-26T00:00:00Z",
};

// Cache simples em memória com TTL de 60 segundos para evitar quota de leituras no Firebase
let cachedPosts: { data: BlogPost[]; timestamp: number } | null = null;
let cachedHome: { data: HomeContent; timestamp: number } | null = null;
const CACHE_TTL_MS = 60 * 1000; // 60 segundos

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const now = Date.now();
  if (cachedPosts && now - cachedPosts.timestamp < CACHE_TTL_MS) {
    return cachedPosts.data;
  }

  if (!adminDb) {
    return DEFAULT_POSTS;
  }

  try {
    const snapshot = await adminDb
      .collection("posts")
      .orderBy("publishedAt", "desc")
      .limit(30)
      .get();

    if (snapshot.empty) {
      // Se a coleção ainda estiver vazia no Firestore, inicializa o cache com os posts padrão
      cachedPosts = { data: DEFAULT_POSTS, timestamp: now };
      return DEFAULT_POSTS;
    }

    const posts: BlogPost[] = snapshot.docs
      .map((doc: QueryDocumentSnapshot) => {
        const d = doc.data();
        return {
          id: doc.id,
          title: d.title || "",
          slug: d.slug || doc.id,
          summary: d.summary || "",
          content: d.content || "",
          coverImage: d.coverImage || "",
          category: d.category || "Geral",
          publishedAt: d.publishedAt || new Date().toISOString().split("T")[0],
          likes: typeof d.likes === "number" ? d.likes : 0,
          featured: Boolean(d.featured),
          status: d.status || "published",
          updatedAt: d.updatedAt || "",
        };
      })
      .filter((p) => p.status === "published");

    cachedPosts = { data: posts, timestamp: now };
    return posts;
  } catch (error) {
    console.warn("Firestore posts fetch error (fallback to default):", error);
    return DEFAULT_POSTS;
  }
}

export async function getAllPostsAdmin(): Promise<BlogPost[]> {
  if (!adminDb) {
    return DEFAULT_POSTS;
  }

  try {
    const snapshot = await adminDb
      .collection("posts")
      .orderBy("publishedAt", "desc")
      .limit(50)
      .get();

    if (snapshot.empty) {
      return DEFAULT_POSTS;
    }

    return snapshot.docs.map((doc: QueryDocumentSnapshot) => {
      const d = doc.data();
      return {
        id: doc.id,
        title: d.title || "",
        slug: d.slug || doc.id,
        summary: d.summary || "",
        content: d.content || "",
        coverImage: d.coverImage || "",
        category: d.category || "Geral",
        publishedAt: d.publishedAt || new Date().toISOString().split("T")[0],
        likes: typeof d.likes === "number" ? d.likes : 0,
        featured: Boolean(d.featured),
        status: d.status || "published",
        updatedAt: d.updatedAt || "",
      };
    });
  } catch (error) {
    console.error("Error fetching admin posts:", error);
    return DEFAULT_POSTS;
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await getPublishedPosts();
  const found = posts.find((p) => p.slug === slug);
  if (found) return found;

  if (!adminDb) return null;

  try {
    const snapshot = await adminDb
      .collection("posts")
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    const d = doc.data();
    return {
      id: doc.id,
      title: d.title || "",
      slug: d.slug || doc.id,
      summary: d.summary || "",
      content: d.content || "",
      coverImage: d.coverImage || "",
      category: d.category || "Geral",
      publishedAt: d.publishedAt || "",
      likes: typeof d.likes === "number" ? d.likes : 0,
      featured: Boolean(d.featured),
      status: d.status || "published",
      updatedAt: d.updatedAt || "",
    };
  } catch {
    return null;
  }
}

export async function getHomeContent(): Promise<HomeContent> {
  const now = Date.now();
  if (cachedHome && now - cachedHome.timestamp < CACHE_TTL_MS) {
    return cachedHome.data;
  }

  if (!adminDb) return DEFAULT_HOME_CONTENT;

  try {
    const doc = await adminDb.collection("site_settings").doc("home").get();
    if (!doc.exists) {
      cachedHome = { data: DEFAULT_HOME_CONTENT, timestamp: now };
      return DEFAULT_HOME_CONTENT;
    }
    const d = doc.data() || {};
    const data: HomeContent = {
      heroTagline: d.heroTagline || DEFAULT_HOME_CONTENT.heroTagline,
      heroSubtitle: d.heroSubtitle || DEFAULT_HOME_CONTENT.heroSubtitle,
      aboutHighlight: d.aboutHighlight || DEFAULT_HOME_CONTENT.aboutHighlight,
      twibbonUrl: d.twibbonUrl || DEFAULT_HOME_CONTENT.twibbonUrl,
      updatedAt: d.updatedAt || "",
    };
    cachedHome = { data, timestamp: now };
    return data;
  } catch (error) {
    console.warn("Error fetching home content from firestore:", error);
    return DEFAULT_HOME_CONTENT;
  }
}

export function invalidateCache() {
  cachedPosts = null;
  cachedHome = null;
}
