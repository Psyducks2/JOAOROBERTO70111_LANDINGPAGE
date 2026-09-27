import { BlogPost, HomeContent } from "./types";
import { adminDb } from "./firebase-admin";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";

export { DEFAULT_POSTS, DEFAULT_HOME_CONTENT } from "./default-content";
import { DEFAULT_POSTS, DEFAULT_HOME_CONTENT } from "./default-content";


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
      ...DEFAULT_HOME_CONTENT,
      ...d,
      timeline:
        Array.isArray(d.timeline) && d.timeline.length > 0
          ? d.timeline
          : DEFAULT_HOME_CONTENT.timeline,
      proposals:
        Array.isArray(d.proposals) && d.proposals.length > 0
          ? d.proposals
          : DEFAULT_HOME_CONTENT.proposals,
      coalitionParties:
        Array.isArray(d.coalitionParties) && d.coalitionParties.length > 0
          ? d.coalitionParties
          : DEFAULT_HOME_CONTENT.coalitionParties,
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
