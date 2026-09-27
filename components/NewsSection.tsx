import { getPublishedPosts } from "@/lib/posts";
import Link from "next/link";
import { IconHeart } from "@/components/Icons";

export default async function NewsSection() {
  const allPosts = await getPublishedPosts();
  const recentPosts = allPosts.slice(0, 3);

  if (recentPosts.length === 0) return null;

  return (
    <section className="section section--news" id="noticias">
      <div className="container">
        <div className="section-head">
          <span className="pill pill--orange">DIÁRIO DE CAMPANHA</span>
          <h2 className="title">Últimas Notícias e Ações</h2>
          <p className="subtitle">
            Acompanhe o dia a dia, visitas às comunidades e as propostas de João Roberto em todo o Amazonas.
          </p>
        </div>

        <div className="blog-grid">
          {recentPosts.map((post) => (
            <article key={post.slug} className="blog-card">
              {post.coverImage && (
                <div className="blog-card-image">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={post.coverImage} alt={post.title} loading="lazy" />
                </div>
              )}
              <div className="blog-card-body">
                <div className="blog-card-meta">
                  <span className="badge-tag">{post.category}</span>
                  <time dateTime={post.publishedAt}>{post.publishedAt}</time>
                  <span className="blog-card-likes" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <IconHeart size={13} fill="#ef4444" style={{ color: "#ef4444" }} />
                    <span>{post.likes || 0}</span>
                  </span>
                </div>

                <h3 className="blog-card-title">
                  <Link href={`/noticias/${post.slug}`}>{post.title}</Link>
                </h3>

                <p className="blog-card-summary">{post.summary}</p>

                <Link href={`/noticias/${post.slug}`} className="blog-card-link">
                  Ler matéria completa →
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="news-cta-center">
          <Link href="/noticias" className="btn btn--secondary">
            Ver Todas as Notícias e Atualizações →
          </Link>
        </div>
      </div>
    </section>
  );
}
