"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { BlogPost, HomeContent } from "@/lib/types";

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados de Login
  const [emailOrUser, setEmailOrUser] = useState("joaoroberto70111");
  const [password, setPassword] = useState("joaoroberto70111");
  const [authError, setAuthError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Estados do Dashboard
  const [activeTab, setActiveTab] = useState<"posts" | "home">("posts");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [homeContent, setHomeContent] = useState<HomeContent>({
    heroTagline: "",
    heroSubtitle: "",
    aboutHighlight: "",
    twibbonUrl: "",
  });

  // Estados do Formulário de Postagem
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost>>({
    title: "",
    slug: "",
    summary: "",
    content: "",
    coverImage: "",
    category: "Mandato",
    status: "published",
    featured: false,
    likes: 0,
  });
  const [saveSuccess, setSaveSuccess] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Estados de Upload para Firebase Storage
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Carrega dados do painel
  const loadData = useCallback(async (currentUser: User) => {
    try {
      const token = await currentUser.getIdToken();

      // Carrega posts
      const postsRes = await fetch("/api/posts?admin=true", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData);
      }

      // Carrega dados da Home
      const homeRes = await fetch("/api/settings/home");
      if (homeRes.ok) {
        const homeData = await homeRes.json();
        setHomeContent(homeData);
      }
    } catch (err) {
      console.error("Erro ao carregar dados do painel:", err);
    }
  }, []);

  // Verifica estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        loadData(currentUser);
      }
    });

    return () => unsubscribe();
  }, [loadData]);

  // Login handler com suporte a múltiplos aliases e auto-recuperação
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsLoggingIn(true);

    const raw = emailOrUser.trim().toLowerCase();
    let candidates: string[] = [];

    if (raw.includes("@")) {
      candidates = [raw];
    } else {
      candidates = [
        raw === "joaoroberto70111" ? "joaoroberto70111@joaoroberto70111.com" : null,
        raw === "admin" ? "admin@joaoroberto70111.com" : null,
        `${raw}@joaoroberto70111.com`,
        "joaoroberto70111@joaoroberto70111.com",
        "admin@joaoroberto70111.com",
      ].filter((item, index, self): item is string => Boolean(item) && self.indexOf(item) === index);
    }

    let lastError: unknown = null;
    let loggedIn = false;

    // 1. Tentar fazer login com cada candidato
    for (const testEmail of candidates) {
      try {
        await signInWithEmailAndPassword(auth, testEmail, password);
        loggedIn = true;
        break;
      } catch (err) {
        lastError = err;
      }
    }

    // 2. Se falhar, tentar sincronizar via bootstrap e re-testar
    if (!loggedIn) {
      try {
        await fetch("/api/auth/bootstrap", { method: "POST" });
        for (const testEmail of candidates) {
          try {
            await signInWithEmailAndPassword(auth, testEmail, password);
            loggedIn = true;
            break;
          } catch (retryErr) {
            lastError = retryErr;
          }
        }
      } catch (bootErr) {
        console.warn("Bootstrap call error:", bootErr);
      }
    }

    // 3. Exibir feedback detalhado caso não autentique
    if (!loggedIn && lastError) {
      const msg = lastError instanceof Error ? lastError.message : String(lastError);
      if (msg.includes("operation-not-allowed")) {
        setAuthError(
          "O login por E-mail/Senha precisa ser ativado no Firebase Console (Authentication > Sign-in method)."
        );
      } else if (
        msg.includes("invalid-credential") ||
        msg.includes("wrong-password") ||
        msg.includes("user-not-found")
      ) {
        setAuthError("Senha ou usuário incorretos. Verifique suas credenciais.");
      } else if (msg.includes("too-many-requests")) {
        setAuthError("Muitas tentativas consecutivas. Aguarde alguns instantes e tente novamente.");
      } else {
        setAuthError(`Falha na autenticação: ${msg}`);
      }
    }

    setIsLoggingIn(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // Upload de Imagem para o Firebase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingImage(true);
    setUploadError("");

    try {
      const token = await user.getIdToken();
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Falha no upload da imagem");
      }

      const data = await res.json();
      setCurrentPost((prev) => ({ ...prev, coverImage: data.url }));
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Erro ao subir imagem");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Salvar Postagem no Firestore
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setSaveSuccess("");
    setSaveError("");

    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(currentPost),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Falha ao salvar postagem");
      }

      setSaveSuccess("Postagem do blog salva com sucesso!");
      setIsEditingPost(false);
      setCurrentPost({
        title: "",
        slug: "",
        summary: "",
        content: "",
        coverImage: "",
        category: "Mandato",
        status: "published",
        featured: false,
        likes: 0,
      });
      await loadData(user);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setIsSaving(false);
    }
  };

  // Excluir Postagem
  const handleDeletePost = async (id: string, title: string) => {
    if (!user) return;
    if (!window.confirm(`Tem certeza que deseja excluir esta postagem: "${title}"?`)) {
      return;
    }

    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/posts?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id && p.slug !== id));
      } else {
        alert("Erro ao excluir postagem.");
      }
    } catch (err) {
      console.error(err);
      alert("Falha na comunicação com o servidor.");
    }
  };

  // Salvar Configurações da Home
  const handleSaveHome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setSaveSuccess("");
    setSaveError("");

    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/settings/home", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(homeContent),
      });

      if (!res.ok) {
        throw new Error("Falha ao salvar alterações da Home");
      }

      setSaveSuccess("Conteúdo da Home atualizado com sucesso!");
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="admin-spinner"></div>
        <p>Carregando painel...</p>
      </div>
    );
  }

  // TELA DE LOGIN (Se não estiver autenticado)
  if (!user) {
    return (
      <div className="admin-login-wrapper">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <span className="brand-number">70111</span>
            <h2>Acesso Administrativo</h2>
            <p>Painel oficial de gerenciamento do Blog e da Home</p>
          </div>

          {authError && <div className="admin-alert admin-alert--error">{authError}</div>}

          <form onSubmit={handleLogin} className="admin-form">
            <div className="form-group">
              <label htmlFor="emailOrUser">Usuário ou E-mail</label>
              <input
                id="emailOrUser"
                type="text"
                value={emailOrUser}
                onChange={(e) => setEmailOrUser(e.target.value)}
                placeholder="joaoroberto70111 ou seu email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Senha de Acesso</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha"
                required
              />
            </div>

            <button type="submit" className="btn btn--primary btn--full" disabled={isLoggingIn}>
              {isLoggingIn ? "Verificando credenciais..." : "Entrar no Painel"}
            </button>
          </form>

          <div className="admin-login-footer">
            <Link href="/" className="back-link">
              ← Voltar para o site público
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // DASHBOARD ADMINISTRATIVO (Quando autenticado)
  return (
    <div className="admin-dashboard">
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <span className="brand-number">70111</span>
          <div>
            <h1>Painel de Controle · João Roberto</h1>
            <span className="admin-user-badge">{user.email}</span>
          </div>
        </div>

        <div className="admin-topbar-actions">
          <Link href="/blog" target="_blank" rel="noopener noreferrer" className="btn btn--secondary btn--sm">
            Ver Blog ↗
          </Link>
          <Link href="/" target="_blank" rel="noopener noreferrer" className="btn btn--secondary btn--sm">
            Ver Site ↗
          </Link>
          <button type="button" onClick={handleLogout} className="btn btn--logout btn--sm">
            Sair
          </button>
        </div>
      </header>

      <main className="admin-main container">
        {saveSuccess && <div className="admin-alert admin-alert--success">{saveSuccess}</div>}
        {saveError && <div className="admin-alert admin-alert--error">{saveError}</div>}

        <div className="admin-tabs">
          <button
            type="button"
            className={`admin-tab ${activeTab === "posts" ? "is-active" : ""}`}
            onClick={() => {
              setActiveTab("posts");
              setIsEditingPost(false);
            }}
          >
            Postagens do Blog ({posts.length})
          </button>
          <button
            type="button"
            className={`admin-tab ${activeTab === "home" ? "is-active" : ""}`}
            onClick={() => setActiveTab("home")}
          >
            Conteúdo da Home (Slugs / Textos)
          </button>
        </div>

        {/* ABA: POSTAGENS DO BLOG */}
        {activeTab === "posts" && (
          <div className="admin-tab-content">
            <div className="admin-section-header">
              <div>
                <h2>Gerenciamento do Blog</h2>
                <p>Crie, edite ou exclua postagens e artigos do candidato. As imagens sobem direto para o Firebase Storage.</p>
              </div>
              {!isEditingPost && (
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => {
                    setCurrentPost({
                      title: "",
                      slug: "",
                      summary: "",
                      content: "",
                      coverImage: "",
                      category: "Mandato",
                      status: "published",
                      featured: false,
                      likes: 0,
                    });
                    setIsEditingPost(true);
                  }}
                >
                  + Nova Postagem no Blog
                </button>
              )}
            </div>

            {/* FORMULÁRIO DE CRIAÇÃO / EDIÇÃO DE POST */}
            {isEditingPost ? (
              <form onSubmit={handleSavePost} className="admin-card admin-post-form">
                <h3>{currentPost.id ? "Editar Postagem" : "Criar Nova Postagem no Blog"}</h3>

                <div className="form-grid">
                  <div className="form-group form-group--span2">
                    <label>Título do Artigo / Post *</label>
                    <input
                      type="text"
                      value={currentPost.title || ""}
                      onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
                      placeholder="Ex: João Roberto defende investimentos em infraestrutura no interior..."
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Slug (URL Amigável)</label>
                    <input
                      type="text"
                      value={currentPost.slug || ""}
                      onChange={(e) => setCurrentPost({ ...currentPost, slug: e.target.value })}
                      placeholder="gerado automaticamente a partir do título"
                    />
                  </div>

                  <div className="form-group">
                    <label>Categoria / Tag</label>
                    <input
                      type="text"
                      value={currentPost.category || ""}
                      onChange={(e) => setCurrentPost({ ...currentPost, category: e.target.value })}
                      placeholder="Ex: Saúde, Interior, Emprego, Campanha"
                    />
                  </div>

                  {/* UPLOAD DE IMAGEM COM FIREBASE STORAGE */}
                  <div className="form-group form-group--span2 upload-group">
                    <label>Imagem de Capa (Opcional)</label>
                    <p className="form-hint">
                      Você pode subir uma foto do seu computador/celular direto para o Firebase Storage, colar uma URL, ou <strong>deixar em branco</strong> se preferir publicar sem imagem!
                    </p>

                    <div className="upload-box">
                      <input
                        type="file"
                        accept="image/*"
                        id="image-file-input"
                        onChange={handleFileUpload}
                        style={{ display: "none" }}
                      />
                      <label htmlFor="image-file-input" className="btn btn--secondary btn--sm">
                        📁 Subir Foto (Firebase Storage)
                      </label>
                      {isUploadingImage && (
                        <span className="upload-status">Enviando para o Firebase Storage...</span>
                      )}
                      {uploadError && <span className="upload-error">{uploadError}</span>}
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <input
                        type="url"
                        value={currentPost.coverImage || ""}
                        onChange={(e) => setCurrentPost({ ...currentPost, coverImage: e.target.value })}
                        placeholder="Ou digite o link direto da imagem (https://...)"
                      />
                    </div>

                    {currentPost.coverImage && currentPost.coverImage.trim() !== "" && (
                      <div className="upload-preview">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={currentPost.coverImage} alt="Pré-visualização" />
                        <button
                          type="button"
                          className="btn-remove-image"
                          onClick={() => setCurrentPost((prev) => ({ ...prev, coverImage: "" }))}
                        >
                          ✕ Remover Foto
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="form-group form-group--span2">
                    <label>Resumo Curto (chamada do artigo)</label>
                    <textarea
                      rows={2}
                      value={currentPost.summary || ""}
                      onChange={(e) => setCurrentPost({ ...currentPost, summary: e.target.value })}
                      placeholder="Breve resumo que aparece no card antes do leitor clicar..."
                    />
                  </div>

                  <div className="form-group form-group--span2">
                    <label>Texto Completo do Artigo *</label>
                    <textarea
                      rows={8}
                      value={currentPost.content || ""}
                      onChange={(e) => setCurrentPost({ ...currentPost, content: e.target.value })}
                      placeholder="Escreva aqui o artigo, pronunciamento, prestação de contas..."
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Status da Publicação</label>
                    <select
                      value={currentPost.status || "published"}
                      onChange={(e) =>
                        setCurrentPost({
                          ...currentPost,
                          status: e.target.value as "published" | "draft",
                        })
                      }
                    >
                      <option value="published">Publicado no Blog</option>
                      <option value="draft">Rascunho (Privado)</option>
                    </select>
                  </div>

                  <div className="form-group form-group--checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={Boolean(currentPost.featured)}
                        onChange={(e) =>
                          setCurrentPost({ ...currentPost, featured: e.target.checked })
                        }
                      />
                      Destacar no topo do Blog
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn--primary" disabled={isSaving}>
                    {isSaving ? "Salvando..." : "Salvar Artigo"}
                  </button>
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={() => setIsEditingPost(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              /* LISTAGEM DE POSTAGENS */
              <div className="admin-posts-list">
                {posts.length === 0 ? (
                  <div className="admin-empty-state">
                    <div style={{ fontSize: 32, marginBottom: 12 }}>📝</div>
                    <h3>Nenhuma postagem cadastrada</h3>
                    <p>O blog está limpo e pronto! Clique no botão acima para criar o primeiro artigo do candidato.</p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <div key={post.id || post.slug} className="admin-post-item">
                      <div className="admin-post-item-info">
                        <div className="admin-post-item-tags">
                          <span className="badge-tag">{post.category || "Artigo"}</span>
                          <span
                            className={`badge-status ${
                              post.status === "published" ? "status-published" : "status-draft"
                            }`}
                          >
                            {post.status === "published" ? "Publicado" : "Rascunho"}
                          </span>
                          <span className="admin-post-likes">❤️ {post.likes || 0} curtidas</span>
                        </div>
                        <h3>{post.title}</h3>
                        <p>{post.summary || post.content.slice(0, 100) + "..."}</p>
                        <span className="admin-post-date">
                          {post.publishedAt ? `Data: ${post.publishedAt}` : ""}
                          {post.coverImage ? " · 📷 Com foto" : " · 📄 Sem foto"}
                        </span>
                      </div>

                      <div className="admin-post-item-actions">
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-icon"
                          title="Visualizar no blog"
                        >
                          👁️
                        </Link>
                        <button
                          type="button"
                          className="btn-icon"
                          title="Editar matéria"
                          onClick={() => {
                            setCurrentPost(post);
                            setIsEditingPost(true);
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className="btn-icon btn-icon--delete"
                          title="Excluir postagem"
                          onClick={() => handleDeletePost(post.id || post.slug, post.title)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* ABA: CONTEÚDO DA HOME */}
        {activeTab === "home" && (
          <div className="admin-tab-content">
            <div className="admin-section-header">
              <div>
                <h2>Informações Dinâmicas da Página Inicial (Home)</h2>
                <p>Altere os textos de destaque, subtítulos e links do site sem precisar mexer no código.</p>
              </div>
            </div>

            <form onSubmit={handleSaveHome} className="admin-card">
              <div className="form-grid">
                <div className="form-group form-group--span2">
                  <label>Slogan Principal do Hero</label>
                  <input
                    type="text"
                    value={homeContent.heroTagline}
                    onChange={(e) =>
                      setHomeContent({ ...homeContent, heroTagline: e.target.value })
                    }
                    placeholder="CORAGEM PARA FAZER. EXPERIÊNCIA PARA AVANÇAR."
                    required
                  />
                </div>

                <div className="form-group form-group--span2">
                  <label>Subtítulo do Hero</label>
                  <textarea
                    rows={3}
                    value={homeContent.heroSubtitle}
                    onChange={(e) =>
                      setHomeContent({ ...homeContent, heroSubtitle: e.target.value })
                    }
                    placeholder="Descrição introdutória logo abaixo da foto principal..."
                    required
                  />
                </div>

                <div className="form-group form-group--span2">
                  <label>Destaque Biográfico da Seção &ldquo;Sobre&rdquo;</label>
                  <textarea
                    rows={2}
                    value={homeContent.aboutHighlight}
                    onChange={(e) =>
                      setHomeContent({ ...homeContent, aboutHighlight: e.target.value })
                    }
                    placeholder="Ex-vice-prefeito de Manacapuru, com atuação reconhecida na saúde..."
                    required
                  />
                </div>

                <div className="form-group form-group--span2">
                  <label>Link do Botão de Apoio (Twibbonize / Twibbon)</label>
                  <input
                    type="url"
                    value={homeContent.twibbonUrl}
                    onChange={(e) =>
                      setHomeContent({ ...homeContent, twibbonUrl: e.target.value })
                    }
                    placeholder="https://www.twibbonize.com/joaoroberto70111depestadual"
                    required
                  />
                </div>
              </div>

              <div className="form-actions" style={{ marginTop: 24 }}>
                <button type="submit" className="btn btn--primary" disabled={isSaving}>
                  {isSaving ? "Gravando no Firestore..." : "Salvar Conteúdo da Home"}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
