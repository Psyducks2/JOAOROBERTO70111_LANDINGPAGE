import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LikeButton from "@/components/LikeButton";
import { getPostBySlug, getPublishedPosts } from "@/lib/posts";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "Notícia não encontrada" };
  }

  return {
    title: `${post.title} · João Roberto 70111`,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function PostDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const shareText = encodeURIComponent(`${post.title} - João Roberto 70111`);
  const whatsappUrl = `https://api.whatsapp.com/send?text=${shareText}`;

  return (
    <>
      <Header />

      <main className="post-detail-page">
        <article className="container post-container">
          <div className="post-breadcrumbs">
            <Link href="/">Início</Link> &rsaquo; <Link href="/noticias">Notícias</Link> &rsaquo;{" "}
            <span>{post.category}</span>
          </div>

          <header className="post-header">
            <div className="post-meta">
              <span className="badge-tag">{post.category}</span>
              <time dateTime={post.publishedAt}>{post.publishedAt}</time>
              <span className="post-author">Por João Roberto 70111</span>
            </div>

            <h1 className="post-title">{post.title}</h1>
            <p className="post-lead">{post.summary}</p>
          </header>

          {post.coverImage && (
            <div className="post-cover">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.coverImage} alt={post.title} />
            </div>
          )}

          <div className="post-body">
            {post.content.split("\n\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <footer className="post-engagement">
            <div className="post-actions">
              <LikeButton slug={post.slug} initialLikes={post.likes || 0} />

              <div className="post-share">
                <span>Compartilhar:</span>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-share btn-share--whatsapp"
                  aria-label="Compartilhar no WhatsApp"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z" />
                  </svg>
                  WhatsApp
                </a>
              </div>
            </div>

            <div className="post-navigation">
              <Link href="/noticias" className="btn btn--secondary btn--sm">
                ← Voltar para todas as notícias
              </Link>
            </div>
          </footer>
        </article>
      </main>

      <Footer />
    </>
  );
}
