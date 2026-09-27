import { getPublishedPosts } from "@/lib/posts";
import Link from "next/link";
import { IconHeart } from "@/components/Icons";

export default async function BlogSection() {
  const allPosts = await getPublishedPosts();
  const recentPosts = allPosts.slice(0, 3);

  if (recentPosts.length === 0) return null;

  return (
    <section className="section section--blog" id="blog">
      <div className="container">
        <div className="section-head">
          <span className="pill pill--orange">BLOG OFICIAL</span>
          <h2 className="title">Últimas do Blog</h2>
          <p className="subtitle">
            Acompanhe artigos, propostas e o posicionamento de João Roberto sobre os temas mais importantes do Amazonas.
          </p>
        </div>

        <div className="blog-grid">
          {recentPosts.map((post) => {
            const hasImage = Boolean(post.coverImage && post.coverImage.trim() !== "");

            return (
              <article
                key={post.slug}
                className={`blog-card ${hasImage ? "blog-card--has-image" : "blog-card--no-image"}`}
              >
                {hasImage && (
                  <div className="blog-card-image">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={post.coverImage} alt={post.title} loading="lazy" />
                  </div>
                )}
                <div className="blog-card-body">
                  <div className="blog-card-meta">
                    <span className="badge-tag">{post.category || "Artigo"}</span>
                    {post.publishedAt && <time dateTime={post.publishedAt}>{post.publishedAt}</time>}
                    <span className="blog-card-likes" title="Apoios recebidos" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <IconHeart size={13} fill="#ef4444" style={{ color: "#ef4444" }} />
                      <span>{post.likes || 0}</span>
                    </span>
                  </div>

                  <h3 className="blog-card-title">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>

                  {post.summary && <p className="blog-card-summary">{post.summary}</p>}

                  <div className="blog-card-footer">
                    <Link href={`/blog/${post.slug}`} className="blog-card-link">
                      Ler artigo completo →
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="blog-cta-center">
          <Link href="/blog" className="btn btn--secondary">
            Ver Todas as Postagens do Blog →
          </Link>
        </div>
      </div>
    </section>
  );
}
