import { BlogPost, HomeContent } from "./types";
import { adminDb } from "./firebase-admin";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";

export const DEFAULT_POSTS: BlogPost[] = [];

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
