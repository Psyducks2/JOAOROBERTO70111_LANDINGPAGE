import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getPublishedPosts } from "@/lib/posts";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog Oficial · João Roberto 70111",
  description:
    "Artigos, posicionamentos, visitas às comunidades e atualizações do candidato a Deputado Estadual João Roberto (70111).",
};

export const revalidate = 60; // Cache de 60 segundos para poupar leitura do Firebase

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <Header />

      <main className="blog-page">
        <div className="blog-hero">
          <div className="container">
            <span className="pill pill--orange">BLOG OFICIAL</span>
            <h1>Blog do João Roberto</h1>
            <p>
              Artigos, propostas, prestação de contas e o dia a dia de trabalho por todo o interior e capital do Amazonas.
            </p>
          </div>
        </div>

        <div className="container blog-content-section">
          {posts.length === 0 ? (
            <div className="blog-empty-card">
              <div className="blog-empty-icon">📝</div>
              <h2>Nenhuma postagem publicada ainda</h2>
              <p>
                O blog oficial do candidato está no ar! Fique atento às próximas atualizações e
                acompanhe também o dia a dia pelo Instagram oficial.
              </p>
              <div className="blog-empty-actions">
                <a
                  href="https://www.instagram.com/joaoroberto.am/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--primary"
                >
                  Seguir no Instagram ↗
                </a>
                <Link href="/" className="btn btn--secondary">
                  Voltar para a Página Inicial
                </Link>
              </div>
            </div>
          ) : (
            <div className="blog-grid">
              {posts.map((post) => {
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
                        <span className="blog-card-likes" title="Apoios recebidos">
                          ❤️ {post.likes || 0}
                        </span>
                      </div>

                      <h2 className="blog-card-title">
                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                      </h2>

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
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
