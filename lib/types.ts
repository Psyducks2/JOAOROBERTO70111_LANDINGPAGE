export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage?: string;
  category: string;
  publishedAt: string;
  likes: number;
  featured?: boolean;
  status: "published" | "draft";
  updatedAt?: string;
}

export interface HomeContent {
  heroTagline: string;
  heroSubtitle: string;
  aboutHighlight: string;
  twibbonUrl: string;
  updatedAt?: string;
}
