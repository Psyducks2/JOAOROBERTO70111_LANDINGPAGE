import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getPublishedPosts } from "@/lib/posts";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notícias e Atualizações · João Roberto 70111",
  description:
    "Acompanhe as novidades, visitas, propostas e ações da campanha de João Roberto (70111) a Deputado Estadual pelo Amazonas.",
};

export const revalidate = 60; // Cache de 60 segundos para poupar leitura do Firebase

export default async function NoticiasPage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <Header />

      <main className="blog-page">
        <div className="blog-hero">
          <div className="container">
            <span className="pill pill--orange">DIÁRIO DE CAMPANHA</span>
            <h1>Notícias & Atualizações</h1>
            <p>
              Acompanhe de perto as ações, visitas aos municípios e os compromissos de João Roberto
              com o futuro do nosso Amazonas.
            </p>
          </div>
        </div>

        <div className="container blog-content-section">
          {posts.length === 0 ? (
            <div className="blog-empty">
              <p>Nenhuma notícia publicada no momento. Volte em breve!</p>
            </div>
          ) : (
            <div className="blog-grid">
              {posts.map((post) => (
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
                      <span className="blog-card-likes">❤️ {post.likes || 0}</span>
                    </div>

                    <h2 className="blog-card-title">
                      <Link href={`/noticias/${post.slug}`}>{post.title}</Link>
                    </h2>

                    <p className="blog-card-summary">{post.summary}</p>

                    <Link href={`/noticias/${post.slug}`} className="blog-card-link">
                      Ler matéria completa →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
