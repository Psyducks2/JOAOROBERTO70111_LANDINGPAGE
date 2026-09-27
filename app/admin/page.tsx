"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { BlogPost, HomeContent, TimelineItem, ProposalItem } from "@/lib/types";
import { DEFAULT_HOME_CONTENT } from "@/lib/default-content";

const CATEGORY_SUGGESTIONS = [
  "Mandato",
  "Saúde",
  "Agronegócio",
  "Interior",
  "Educação",
  "Ações Sociais",
  "Infraestrutura",
  "Eleições 2026",
];

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados de Login
  const [emailOrUser, setEmailOrUser] = useState("joaoroberto70111");
  const [password, setPassword] = useState("joaoroberto70111");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Estados do Dashboard
  const [activeTab, setActiveTab] = useState<"posts" | "home">("posts");
  const [homeSectionTab, setHomeSectionTab] = useState<
    "hero" | "sobre" | "propostas" | "coligacao" | "redes" | "final" | "legal"
  >("hero");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [homeContent, setHomeContent] = useState<HomeContent>(DEFAULT_HOME_CONTENT);

  // Estados do Formulário de Postagem
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [postViewMode, setPostViewMode] = useState<"edit" | "preview">("edit");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Gerador automático de Slug limpo e amigável
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  };

  const handleTitleChange = (newTitle: string) => {
    setCurrentPost((prev) => {
      const prevAutoSlug = generateSlug(prev.title || "");
      const shouldAutoSlug = !prev.id && (!prev.slug || prev.slug === prevAutoSlug);
      return {
        ...prev,
        title: newTitle,
        slug: shouldAutoSlug ? generateSlug(newTitle) : prev.slug,
      };
    });
  };

  const handleRegenSlug = () => {
    if (currentPost.title) {
      setCurrentPost((prev) => ({ ...prev, slug: generateSlug(prev.title || "") }));
    }
  };

  const handleAutoSummary = () => {
    if (!currentPost.content) return;
    const plain = currentPost.content
      .replace(/#+\s/g, "")
      .replace(/\*\*|\*|__/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .trim();
    const sentence = plain.split("\n")[0] || plain;
    const summary = sentence.length > 160 ? sentence.substring(0, 157) + "..." : sentence;
    setCurrentPost((prev) => ({ ...prev, summary }));
  };

  const insertMarkdown = (prefix: string, suffix: string = "", defaultText: string = "") => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const val = currentPost.content || "";
    const selected = val.substring(start, end) || defaultText;
    const replacement = `${prefix}${selected}${suffix}`;
    const nextVal = val.substring(0, start) + replacement + val.substring(end);
    setCurrentPost((prev) => ({ ...prev, content: nextVal }));
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 10);
  };

  // Renderizador seguro de Markdown para a Pré-visualização do Post
  const renderPreviewMarkdown = (text: string) => {
    if (!text || text.trim() === "") {
      return (
        <p style={{ color: "#94a3b8", fontStyle: "italic", margin: "24px 0" }}>
          O texto do artigo está vazio. Volte para a aba &quot;Editor&quot; e comece a escrever!
        </p>
      );
    }
    const blocks = text.split(/\n\s*\n/);
    return blocks.map((block, idx) => {
      const trimmed = block.trim();
      if (!trimmed) return null;
      if (trimmed.startsWith("### ")) {
        return (
          <h4 key={idx} style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", marginTop: "1.25rem", marginBottom: "0.5rem" }}>
            {trimmed.slice(4)}
          </h4>
        );
      }
      if (trimmed.startsWith("## ")) {
        return (
          <h3 key={idx} style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginTop: "1.75rem", marginBottom: "0.75rem" }}>
            {trimmed.slice(3)}
          </h3>
        );
      }
      if (trimmed.startsWith("# ")) {
        return (
          <h2 key={idx} style={{ fontSize: "1.85rem", fontWeight: 900, color: "#0059b2", marginTop: "2rem", marginBottom: "1rem" }}>
            {trimmed.slice(2)}
          </h2>
        );
      }
      if (trimmed.startsWith("> ")) {
        return (
          <blockquote key={idx} style={{ borderLeft: "4px solid #0059b2", padding: "12px 18px", margin: "18px 0", color: "#1e3a8a", fontStyle: "italic", background: "#f0f7ff", borderRadius: "0 8px 8px 0" }}>
            {trimmed.slice(2)}
          </blockquote>
        );
      }
      if (trimmed === "---" || trimmed === "***") {
        return <hr key={idx} style={{ border: "none", borderTop: "1.5px solid #e2e8f0", margin: "2rem 0" }} />;
      }
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const items = trimmed.split("\n").filter((l) => l.trim().startsWith("- ") || l.trim().startsWith("* "));
        return (
          <ul key={idx} style={{ paddingLeft: "1.75rem", margin: "1rem 0", color: "#334155", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {items.map((item, i) => (
              <li key={i}>{item.replace(/^[-*]\s+/, "")}</li>
            ))}
          </ul>
        );
      }
      if (/^\d+\.\s/.test(trimmed)) {
        const items = trimmed.split("\n").filter((l) => /^\d+\.\s/.test(l.trim()));
        return (
          <ol key={idx} style={{ paddingLeft: "1.75rem", margin: "1rem 0", color: "#334155", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {items.map((item, i) => (
              <li key={i}>{item.replace(/^\d+\.\s+/, "")}</li>
            ))}
          </ol>
        );
      }
      return (
        <p key={idx} style={{ marginBottom: "1.25rem", lineHeight: "1.8", color: "#334155", fontSize: "1.05rem", whiteSpace: "pre-line" }}>
          {trimmed}
        </p>
      );
    });
  };

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
        setHomeContent({
          ...DEFAULT_HOME_CONTENT,
          ...homeData,
          timeline:
            Array.isArray(homeData.timeline) && homeData.timeline.length > 0
              ? homeData.timeline
              : DEFAULT_HOME_CONTENT.timeline,
          proposals:
            Array.isArray(homeData.proposals) && homeData.proposals.length > 0
              ? homeData.proposals
              : DEFAULT_HOME_CONTENT.proposals,
          coalitionParties:
            Array.isArray(homeData.coalitionParties) &&
            homeData.coalitionParties.length > 0
              ? homeData.coalitionParties
              : DEFAULT_HOME_CONTENT.coalitionParties,
        });
      }
    } catch (err) {
      console.error("Erro ao carregar dados do painel:", err);
    }
  }, []);

  // Leitura de parâmetros de busca da URL (?tab=home etc)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "home" || tab === "posts") {
        setActiveTab(tab);
      }
      const sec = params.get("section");
      if (
        sec &&
        ["hero", "sobre", "propostas", "coligacao", "redes", "final", "legal"].includes(
          sec
        )
      ) {
        setHomeSectionTab(sec as any);
      }
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

  // Handlers para Linha do Tempo da Home
  const handleAddTimeline = () => {
    setHomeContent((prev) => ({
      ...prev,
      timeline: [...(prev.timeline || []), { title: "", text: "" }],
    }));
  };

  const handleUpdateTimeline = (
    index: number,
    field: "title" | "text",
    val: string
  ) => {
    setHomeContent((prev) => {
      const next = [...(prev.timeline || [])];
      next[index] = { ...next[index], [field]: val };
      return { ...prev, timeline: next };
    });
  };

  const handleDeleteTimeline = (index: number) => {
    setHomeContent((prev) => ({
      ...prev,
      timeline: (prev.timeline || []).filter((_, i) => i !== index),
    }));
  };

  // Handlers para Propostas da Home
  const handleAddProposal = () => {
    setHomeContent((prev) => ({
      ...prev,
      proposals: [
        ...(prev.proposals || []),
        { title: "", text: "", featured: false },
      ],
    }));
  };

  const handleUpdateProposal = (
    index: number,
    field: "title" | "text" | "featured",
    val: unknown
  ) => {
    setHomeContent((prev) => {
      const next = [...(prev.proposals || [])];
      next[index] = { ...next[index], [field]: val } as ProposalItem;
      return { ...prev, proposals: next };
    });
  };

  const handleDeleteProposal = (index: number) => {
    setHomeContent((prev) => ({
      ...prev,
      proposals: (prev.proposals || []).filter((_, i) => i !== index),
    }));
  };

  // Salvar Configurações da Home
  const handleSaveHome = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

      setSaveSuccess("Conteúdo da Página Inicial salvo com sucesso e publicado!");
      setTimeout(() => setSaveSuccess(""), 4500);
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
      <div className="admin-login-page">
        {/* Efeitos de iluminação dinâmica de fundo */}
        <div className="login-ambient-glow login-ambient-glow--1" />
        <div className="login-ambient-glow login-ambient-glow--2" />
        <div className="login-ambient-glow login-ambient-glow--3" />
        <div className="login-mesh-pattern" />

        <div className="admin-login-container">
          <div className="admin-login-card">
            {/* Header com Insígnia e Marca */}
            <div className="admin-login-header">
              <div className="admin-emblem-badge">
                <span className="brand-number">70111</span>
                <span className="badge-shield-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </span>
              </div>

              <span className="admin-pill-tag">GESTÃO DE CONTEÚDO OFICIAL</span>
              <h1 className="admin-login-title">Acesso Administrativo</h1>
              <p className="admin-login-subtitle">
                Painel oficial de gerenciamento do <strong>Blog</strong> e conteúdo de <strong>João Roberto</strong>
              </p>
            </div>

            {/* Alerta de erro estilizado */}
            {authError && (
              <div className="admin-alert-banner">
                <span className="alert-banner-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </span>
                <div className="alert-banner-text">
                  <strong>Não foi possível entrar</strong>
                  <p>{authError}</p>
                </div>
              </div>
            )}

            {/* Formulário com inputs ricos */}
            <form onSubmit={handleLogin} className="admin-login-form">
              <div className="form-input-group">
                <label htmlFor="emailOrUser" className="input-label">
                  <span className="label-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  Usuário ou E-mail
                </label>
                <div className="input-field-wrapper">
                  <input
                    id="emailOrUser"
                    type="text"
                    value={emailOrUser}
                    onChange={(e) => setEmailOrUser(e.target.value)}
                    placeholder="joaoroberto70111 ou seu email"
                    required
                    autoComplete="username"
                    className="styled-input"
                  />
                </div>
              </div>

              <div className="form-input-group">
                <div className="input-label-row">
                  <label htmlFor="password" className="input-label">
                    <span className="label-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    Senha de Acesso
                  </label>
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>

                <div className="input-field-wrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    required
                    autoComplete="current-password"
                    className="styled-input styled-input--has-toggle"
                  />
                  <button
                    type="button"
                    className="password-eye-icon"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Ocultar senha" : "Exibir senha"}
                    aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-login-submit"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <span className="btn-spinner" />
                    <span>Autenticando com Firebase...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar no Painel</span>
                    <span className="btn-arrow-icon">→</span>
                  </>
                )}
              </button>
            </form>

            {/* Rodapé com indicadores de segurança e link de retorno */}
            <div className="admin-login-footer">
              <div className="login-security-tag">
                <span className="security-status-dot" />
                <span>Conexão Segura Criptografada SSL · Firebase Auth 256-bit</span>
              </div>

              <Link href="/" className="login-back-button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                <span>Voltar para o site oficial de João Roberto</span>
              </Link>
            </div>
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
          <Link href="/blog" target="_blank" rel="noopener noreferrer" className="btn-topbar-link">
            Ver Blog ↗
          </Link>
          <Link href="/" target="_blank" rel="noopener noreferrer" className="btn-topbar-link">
            Ver Site ↗
          </Link>
          <button type="button" onClick={handleLogout} className="btn-topbar-logout">
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

            {/* FORMULÁRIO DE CRIAÇÃO / EDIÇÃO DE POST COM FERRAMENTAS AVANÇADAS */}
            {isEditingPost ? (
              <form onSubmit={handleSavePost} className="admin-card admin-post-form">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: "#0f172a" }}>
                      {currentPost.id ? "✏️ Editar Artigo do Blog" : "📝 Criar Nova Postagem no Blog"}
                    </h3>
                    <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "0.92rem" }}>
                      Escreva, formate com as ferramentas rápidas e pré-visualize exatamente como os eleitores lerão.
                    </p>
                  </div>
                  <div className="editor-mode-toggle">
                    <button
                      type="button"
                      className={`editor-mode-btn ${postViewMode === "edit" ? "active" : ""}`}
                      onClick={() => setPostViewMode("edit")}
                    >
                      ✏️ Editor de Texto
                    </button>
                    <button
                      type="button"
                      className={`editor-mode-btn ${postViewMode === "preview" ? "active" : ""}`}
                      onClick={() => setPostViewMode("preview")}
                    >
                      👁️ Pré-visualização ao Vivo
                    </button>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group form-group--span2">
                    <label style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.95rem" }}>
                      Título do Artigo / Matéria *
                    </label>
                    <input
                      type="text"
                      value={currentPost.title || ""}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Ex: João Roberto defende investimentos prioritários em infraestrutura e saúde no interior..."
                      required
                      style={{ fontSize: "1.05rem", fontWeight: 600 }}
                    />
                  </div>

                  <div className="form-group">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <label style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.95rem" }}>
                        Slug (URL Amigável)
                      </label>
                      <button
                        type="button"
                        className="btn-regen-slug"
                        onClick={handleRegenSlug}
                        title="Recriar o link a partir do título digitado"
                      >
                        🔄 Recriar do Título
                      </button>
                    </div>
                    <input
                      type="text"
                      value={currentPost.slug || ""}
                      onChange={(e) => setCurrentPost({ ...currentPost, slug: e.target.value })}
                      placeholder="gerado automaticamente a partir do título"
                    />
                    <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block", marginTop: 4 }}>
                      🔗 Link público: /noticias/{currentPost.slug || "url-do-artigo"}
                    </span>
                  </div>

                  <div className="form-group">
                    <label style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.95rem" }}>
                      Categoria / Tema Principal
                    </label>
                    <input
                      type="text"
                      value={currentPost.category || ""}
                      onChange={(e) => setCurrentPost({ ...currentPost, category: e.target.value })}
                      placeholder="Digite ou escolha um dos temas sugeridos abaixo"
                    />
                    <div className="category-chips-list">
                      {CATEGORY_SUGGESTIONS.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          className={`category-chip-btn ${currentPost.category === cat ? "active" : ""}`}
                          onClick={() => setCurrentPost({ ...currentPost, category: cat })}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* UPLOAD DE IMAGEM COM FIREBASE STORAGE */}
                  <div className="form-group form-group--span2 upload-group">
                    <label style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.95rem" }}>
                      Imagem de Capa (Opcional)
                    </label>
                    <p className="form-hint" style={{ color: "#64748b", fontSize: "0.88rem", marginBottom: 10 }}>
                      Você pode subir uma foto do seu computador/celular direto para o Firebase Storage, colar uma URL direta, ou <strong>deixar em branco</strong> se preferir publicar sem imagem de capa!
                    </p>

                    <div className="upload-box" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                      <input
                        type="file"
                        accept="image/*"
                        id="image-file-input"
                        onChange={handleFileUpload}
                        style={{ display: "none" }}
                      />
                      <label htmlFor="image-file-input" className="btn btn-site-preview" style={{ cursor: "pointer" }}>
                        📁 Subir Foto (Firebase Storage)
                      </label>
                      {isUploadingImage && (
                        <span className="upload-status" style={{ color: "#0059b2", fontWeight: 600, fontSize: "0.9rem" }}>
                          ⏳ Enviando para o Firebase Storage...
                        </span>
                      )}
                      {uploadError && <span className="upload-error" style={{ color: "#dc2626", fontWeight: 600, fontSize: "0.9rem" }}>{uploadError}</span>}
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
                      <div className="upload-preview" style={{ marginTop: 12 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={currentPost.coverImage} alt="Pré-visualização" style={{ maxWidth: 320, maxHeight: 180, objectFit: "cover", borderRadius: 8, border: "1px solid #e2e8f0" }} />
                        <button
                          type="button"
                          className="btn-remove-image"
                          onClick={() => setCurrentPost((prev) => ({ ...prev, coverImage: "" }))}
                          style={{ display: "block", marginTop: 6, color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}
                        >
                          ✕ Remover Foto
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="form-group form-group--span2">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <label style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.95rem" }}>
                        Resumo Curto (Apresentação no Card e Redes Sociais)
                      </label>
                      <button
                        type="button"
                        className="btn-regen-slug"
                        onClick={handleAutoSummary}
                        title="Extrair automaticamente o primeiro parágrafo do artigo como resumo"
                      >
                        ⚡ Preencher do 1º Parágrafo
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={currentPost.summary || ""}
                      onChange={(e) => setCurrentPost({ ...currentPost, summary: e.target.value })}
                      placeholder="Breve resumo que aparece no card antes do eleitor clicar para ler o artigo completo..."
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#64748b", marginTop: 4 }}>
                      <span>Aparece na capa do site e na listagem de notícias.</span>
                      <span>{(currentPost.summary || "").length} caracteres</span>
                    </div>
                  </div>

                  {/* CONTEÚDO PRINCIPAL: MODO EDITOR OU MODO PREVIEW */}
                  {postViewMode === "edit" ? (
                    <div className="form-group form-group--span2">
                      <label style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.95rem", marginBottom: 8, display: "block" }}>
                        Texto Completo do Artigo / Matéria *
                      </label>

                      {/* Barra de Ferramentas de Formatação Rápida */}
                      <div className="blog-toolbar">
                        <button
                          type="button"
                          className="blog-tool-btn"
                          onClick={() => insertMarkdown("**", "**", "texto em negrito")}
                          title="Negrito (**texto**)"
                        >
                          <strong>B</strong>
                        </button>
                        <button
                          type="button"
                          className="blog-tool-btn"
                          onClick={() => insertMarkdown("*", "*", "texto em itálico")}
                          title="Itálico (*texto*)"
                        >
                          <em>I</em>
                        </button>
                        <div className="blog-tool-separator" />
                        <button
                          type="button"
                          className="blog-tool-btn"
                          onClick={() => insertMarkdown("\n## ", "\n", "Título da Seção")}
                          title="Título de Seção (H2)"
                        >
                          H2
                        </button>
                        <button
                          type="button"
                          className="blog-tool-btn"
                          onClick={() => insertMarkdown("\n### ", "\n", "Subtítulo")}
                          title="Subtítulo (H3)"
                        >
                          H3
                        </button>
                        <div className="blog-tool-separator" />
                        <button
                          type="button"
                          className="blog-tool-btn"
                          onClick={() => insertMarkdown("\n> ", "\n", "Citação ou fala do candidato")}
                          title="Citação em Destaque"
                        >
                          ❝ Citação
                        </button>
                        <button
                          type="button"
                          className="blog-tool-btn"
                          onClick={() => insertMarkdown("\n- ", "\n", "Item da lista")}
                          title="Lista com Marcadores"
                        >
                          • Lista
                        </button>
                        <button
                          type="button"
                          className="blog-tool-btn"
                          onClick={() => insertMarkdown("\n1. ", "\n", "Item numerado")}
                          title="Lista Numerada"
                        >
                          1. Numerada
                        </button>
                        <div className="blog-tool-separator" />
                        <button
                          type="button"
                          className="blog-tool-btn"
                          onClick={() => insertMarkdown("[", "](https://link.com)", "Texto do Link")}
                          title="Inserir Link"
                        >
                          🔗 Link
                        </button>
                        <button
                          type="button"
                          className="blog-tool-btn"
                          onClick={() => insertMarkdown("\n\n---\n\n", "", "")}
                          title="Linha Divisória"
                        >
                          — Linha
                        </button>
                      </div>

                      <textarea
                        ref={textareaRef}
                        rows={12}
                        className="blog-textarea-with-toolbar"
                        value={currentPost.content || ""}
                        onChange={(e) => setCurrentPost({ ...currentPost, content: e.target.value })}
                        placeholder="Escreva aqui a íntegra da matéria, pronunciamento ou prestação de contas. Use os botões da barra acima para formatar negritos, citações e títulos com agilidade..."
                        required
                      />

                      {/* Barra de Métricas em Tempo Real */}
                      <div className="blog-stats-bar">
                        <span>
                          📝 <strong>{(currentPost.content || "").trim().split(/\s+/).filter(Boolean).length}</strong> palavras
                        </span>
                        <span>
                          🔤 <strong>{(currentPost.content || "").length}</strong> caracteres
                        </span>
                        <span>
                          ⏱️ ~<strong>{Math.max(1, Math.ceil(((currentPost.content || "").trim().split(/\s+/).filter(Boolean).length) / 200))}</strong> min de leitura
                        </span>
                        <span>
                          💡 Dica: Destaque pontos-chave com o botão <strong>B</strong> para enriquecer a leitura.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="form-group form-group--span2">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <label style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.95rem" }}>
                          Pré-visualização do Artigo
                        </label>
                        <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                          Exatamente como o eleitor verá na página de notícias
                        </span>
                      </div>

                      <div className="blog-live-preview">
                        <div className="preview-badge-header">
                          <span style={{ fontWeight: 700, color: "#0059b2", textTransform: "uppercase", fontSize: "0.85rem", letterSpacing: "0.05em" }}>
                            🏷️ {currentPost.category || "Geral"}
                          </span>
                          <span className="preview-status-pill">
                            {currentPost.status === "published" ? "✓ Publicado no Blog" : "✎ Rascunho"}
                          </span>
                        </div>

                        {currentPost.coverImage && currentPost.coverImage.trim() !== "" && (
                          <div className="preview-cover-container">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={currentPost.coverImage} alt={currentPost.title || "Imagem de Capa"} />
                          </div>
                        )}

                        <h1 className="preview-title">
                          {currentPost.title || "Título do Artigo"}
                        </h1>

                        {currentPost.summary && (
                          <p className="preview-summary">
                            {currentPost.summary}
                          </p>
                        )}

                        <div className="preview-body-content">
                          {renderPreviewMarkdown(currentPost.content || "")}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.95rem" }}>
                      Status da Publicação
                    </label>
                    <select
                      value={currentPost.status || "published"}
                      onChange={(e) =>
                        setCurrentPost({
                          ...currentPost,
                          status: e.target.value as "published" | "draft",
                        })
                      }
                      style={{ fontWeight: 600 }}
                    >
                      <option value="published">🟢 Publicado no Blog (Visível a todos)</option>
                      <option value="draft">🟡 Rascunho (Privado / Oculto)</option>
                    </select>
                  </div>

                  <div className="form-group form-group--checkbox" style={{ display: "flex", alignItems: "center" }}>
                    <label style={{ cursor: "pointer", fontWeight: 600, color: "#0f172a" }}>
                      <input
                        type="checkbox"
                        checked={Boolean(currentPost.featured)}
                        onChange={(e) =>
                          setCurrentPost({ ...currentPost, featured: e.target.checked })
                        }
                        style={{ marginRight: 8 }}
                      />
                      ⭐ Destacar no topo do Blog
                    </label>
                  </div>
                </div>

                <div className="form-actions" style={{ marginTop: 24, display: "flex", gap: 12 }}>
                  <button type="submit" className="btn btn-save-home" disabled={isSaving}>
                    {isSaving ? "Gravando Artigo..." : "💾 Salvar Artigo"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-site-preview"
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
            <div className="admin-section-header admin-home-header">
              <div>
                <h2>Gerenciador Completo da Página Inicial (Home)</h2>
                <p>
                  Edite todos os textos, títulos, propostas, biografia, redes sociais e dados oficiais.
                  As alterações são salvas no Firestore e publicadas imediatamente no site.
                </p>
              </div>

              <div className="admin-home-header-actions">
                <Link
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-site-preview"
                >
                  👁️ Ver Site ao Vivo
                </Link>
                <button
                  type="button"
                  onClick={() => handleSaveHome()}
                  className="btn btn-save-home"
                  disabled={isSaving}
                >
                  {isSaving ? "Salvando..." : "💾 Salvar Alterações da Home"}
                </button>
              </div>
            </div>

            {/* Sub-navegação em Abas por Seção */}
            <div className="admin-subtabs" role="tablist">
              <button
                type="button"
                className={`admin-subtab ${homeSectionTab === "hero" ? "is-active" : ""}`}
                onClick={() => setHomeSectionTab("hero")}
              >
                🌟 Topo & Hero
              </button>
              <button
                type="button"
                className={`admin-subtab ${homeSectionTab === "sobre" ? "is-active" : ""}`}
                onClick={() => setHomeSectionTab("sobre")}
              >
                👤 Sobre & Biografia
              </button>
              <button
                type="button"
                className={`admin-subtab ${homeSectionTab === "propostas" ? "is-active" : ""}`}
                onClick={() => setHomeSectionTab("propostas")}
              >
                🎯 Propostas & Bandeiras ({homeContent.proposals?.length || 0})
              </button>
              <button
                type="button"
                className={`admin-subtab ${homeSectionTab === "coligacao" ? "is-active" : ""}`}
                onClick={() => setHomeSectionTab("coligacao")}
              >
                🤝 Coligação & Eleições
              </button>
              <button
                type="button"
                className={`admin-subtab ${homeSectionTab === "redes" ? "is-active" : ""}`}
                onClick={() => setHomeSectionTab("redes")}
              >
                📱 Redes Sociais & Links
              </button>
              <button
                type="button"
                className={`admin-subtab ${homeSectionTab === "final" ? "is-active" : ""}`}
                onClick={() => setHomeSectionTab("final")}
              >
                📢 Chamada Final
              </button>
              <button
                type="button"
                className={`admin-subtab ${homeSectionTab === "legal" ? "is-active" : ""}`}
                onClick={() => setHomeSectionTab("legal")}
              >
                📄 Rodapé & CNPJ
              </button>
            </div>

            <form onSubmit={handleSaveHome} className="admin-home-form">
              {/* SUBTAB: HERO */}
              {homeSectionTab === "hero" && (
                <div className="admin-card">
                  <div className="admin-card-section-title">
                    <h3>Identificação & Apresentação no Topo (Hero)</h3>
                    <p>Textos e chamadas que o eleitor vê no primeiro impacto ao abrir o site.</p>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Selo / Eyebrow Superior</label>
                      <input
                        type="text"
                        value={homeContent.heroEyebrow || ""}
                        onChange={(e) =>
                          setHomeContent({ ...homeContent, heroEyebrow: e.target.value })
                        }
                        placeholder="Eleições 2026 · Amazonas"
                      />
                    </div>

                    <div className="form-group">
                      <label>Nome do Candidato em Destaque</label>
                      <input
                        type="text"
                        value={homeContent.heroCandidateName || ""}
                        onChange={(e) =>
                          setHomeContent({
                            ...homeContent,
                            heroCandidateName: e.target.value,
                          })
                        }
                        placeholder="João Roberto"
                      />
                    </div>

                    <div className="form-group">
                      <label>Número de Urna (Grande no Topo)</label>
                      <input
                        type="text"
                        value={homeContent.heroNumber || ""}
                        onChange={(e) =>
                          setHomeContent({ ...homeContent, heroNumber: e.target.value })
                        }
                        placeholder="70111"
                      />
                    </div>

                    <div className="form-group form-group--span2">
                      <label>Slogan Principal do Hero</label>
                      <input
                        type="text"
                        value={homeContent.heroTagline || ""}
                        onChange={(e) =>
                          setHomeContent({ ...homeContent, heroTagline: e.target.value })
                        }
                        placeholder="CORAGEM PARA FAZER. EXPERIÊNCIA PARA AVANÇAR."
                      />
                    </div>

                    <div className="form-group form-group--span2">
                      <label>Texto Subtítulo / Apresentação Introdutória</label>
                      <textarea
                        rows={3}
                        value={homeContent.heroSubtitle || ""}
                        onChange={(e) =>
                          setHomeContent({ ...homeContent, heroSubtitle: e.target.value })
                        }
                        placeholder="O vice-prefeito mais econômico do Amazonas..."
                      />
                    </div>

                    <div className="form-group">
                      <label>Botão 1 (Primário) - Texto</label>
                      <input
                        type="text"
                        value={homeContent.heroPrimaryBtnText || ""}
                        onChange={(e) =>
                          setHomeContent({
                            ...homeContent,
                            heroPrimaryBtnText: e.target.value,
                          })
                        }
                        placeholder="Seguir no Instagram"
                      />
                    </div>

                    <div className="form-group">
                      <label>Botão 1 (Primário) - Link de Destino</label>
                      <input
                        type="url"
                        value={homeContent.heroPrimaryBtnUrl || ""}
                        onChange={(e) =>
                          setHomeContent({
                            ...homeContent,
                            heroPrimaryBtnUrl: e.target.value,
                          })
                        }
                        placeholder="https://www.instagram.com/joaoroberto.am/"
                      />
                    </div>

                    <div className="form-group">
                      <label>Botão 2 (Secundário) - Texto</label>
                      <input
                        type="text"
                        value={homeContent.heroSecondaryBtnText || ""}
                        onChange={(e) =>
                          setHomeContent({
                            ...homeContent,
                            heroSecondaryBtnText: e.target.value,
                          })
                        }
                        placeholder="Apoiar a campanha"
                      />
                    </div>

                    <div className="form-group">
                      <label>Botão 2 (Secundário) - Link de Destino (Twibbon/Apoio)</label>
                      <input
                        type="url"
                        value={
                          homeContent.heroSecondaryBtnUrl || homeContent.twibbonUrl || ""
                        }
                        onChange={(e) =>
                          setHomeContent({
                            ...homeContent,
                            heroSecondaryBtnUrl: e.target.value,
                            twibbonUrl: e.target.value,
                          })
                        }
                        placeholder="https://www.twibbonize.com/joaoroberto70111depestadual"
                      />
                    </div>

                    <div className="form-group">
                      <label>Selo Informativo 1 (Chip)</label>
                      <input
                        type="text"
                        value={homeContent.heroChip1 || ""}
                        onChange={(e) =>
                          setHomeContent({ ...homeContent, heroChip1: e.target.value })
                        }
                        placeholder="Partido AVANTE"
                      />
                    </div>

                    <div className="form-group">
                      <label>Selo Informativo 2 (Chip)</label>
                      <input
                        type="text"
                        value={homeContent.heroChip2 || ""}
                        onChange={(e) =>
                          setHomeContent({ ...homeContent, heroChip2: e.target.value })
                        }
                        placeholder="Coligação Pra Cima, Amazonas"
                      />
                    </div>

                    <div className="form-group">
                      <label>Selo Informativo 3 (Chip)</label>
                      <input
                        type="text"
                        value={homeContent.heroChip3 || ""}
                        onChange={(e) =>
                          setHomeContent({ ...homeContent, heroChip3: e.target.value })
                        }
                        placeholder="Candidatura deferida (TSE)"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB: SOBRE */}
              {homeSectionTab === "sobre" && (
                <div className="od-stack" style={{ ["--od-gap" as string]: "24px" }}>
                  <div className="admin-card">
                    <div className="admin-card-section-title">
                      <h3>Seção Sobre & Biografia</h3>
                      <p>Histórico, formação e destaques da vida pública de João Roberto.</p>
                    </div>

                    <div className="form-grid">
                      <div className="form-group">
                        <label>Eyebrow da Seção</label>
                        <input
                          type="text"
                          value={homeContent.aboutEyebrow || ""}
                          onChange={(e) =>
                            setHomeContent({ ...homeContent, aboutEyebrow: e.target.value })
                          }
                          placeholder="Quem é João Roberto"
                        />
                      </div>

                      <div className="form-group">
                        <label>Título Principal</label>
                        <input
                          type="text"
                          value={homeContent.aboutTitle || ""}
                          onChange={(e) =>
                            setHomeContent({ ...homeContent, aboutTitle: e.target.value })
                          }
                          placeholder="Contador, gestor público e liderança do interior"
                        />
                      </div>

                      <div className="form-group form-group--span2">
                        <label>Primeiro Parágrafo da Biografia</label>
                        <textarea
                          rows={4}
                          value={homeContent.aboutParagraph1 || ""}
                          onChange={(e) =>
                            setHomeContent({
                              ...homeContent,
                              aboutParagraph1: e.target.value,
                            })
                          }
                          placeholder="Natural de Lábrea, no Amazonas..."
                        />
                      </div>

                      <div className="form-group form-group--span2">
                        <label>Segundo Parágrafo da Biografia</label>
                        <textarea
                          rows={4}
                          value={homeContent.aboutParagraph2 || ""}
                          onChange={(e) =>
                            setHomeContent({
                              ...homeContent,
                              aboutParagraph2: e.target.value,
                            })
                          }
                          placeholder="Sua atuação discreta e comprometida no interior..."
                        />
                      </div>

                      <div className="form-group form-group--span2">
                        <label>Destaque Biográfico Resumido</label>
                        <textarea
                          rows={2}
                          value={homeContent.aboutHighlight || ""}
                          onChange={(e) =>
                            setHomeContent({
                              ...homeContent,
                              aboutHighlight: e.target.value,
                            })
                          }
                          placeholder="Ex-vice-prefeito de Lábrea, com atuação reconhecida na saúde..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Linha do Tempo */}
                  <div className="admin-card">
                    <div className="admin-section-header" style={{ marginBottom: 16 }}>
                      <div>
                        <h3>Linha do Tempo (Trajetória Política)</h3>
                        <p>Marcos históricos e eventos exibidos ao lado da biografia.</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddTimeline}
                        className="btn btn--secondary btn--sm"
                      >
                        ➕ Adicionar Marco
                      </button>
                    </div>

                    <div className="admin-items-list">
                      {(homeContent.timeline || []).map((item, index) => (
                        <div key={index} className="admin-item-card">
                          <div className="admin-item-card-header">
                            <span className="badge-tag">Marco #{index + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteTimeline(index)}
                              className="btn-icon btn-icon--delete"
                              title="Remover este marco"
                            >
                              🗑️
                            </button>
                          </div>
                          <div className="form-grid">
                            <div className="form-group form-group--span2">
                              <label>Título do Marco / Ano</label>
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) =>
                                  handleUpdateTimeline(index, "title", e.target.value)
                                }
                                placeholder="Ex: Vice-prefeito de Lábrea"
                              />
                            </div>
                            <div className="form-group form-group--span2">
                              <label>Descrição do Acontecimento</label>
                              <textarea
                                rows={2}
                                value={item.text}
                                onChange={(e) =>
                                  handleUpdateTimeline(index, "text", e.target.value)
                                }
                                placeholder="Descrição detalhada..."
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB: PROPOSTAS */}
              {homeSectionTab === "propostas" && (
                <div className="od-stack" style={{ ["--od-gap" as string]: "24px" }}>
                  <div className="admin-card">
                    <div className="admin-card-section-title">
                      <h3>Apresentação das Propostas & Bandeiras</h3>
                      <p>Cabeçalho da seção onde os eixos de atuação parlamentar são exibidos.</p>
                    </div>

                    <div className="form-grid">
                      <div className="form-group">
                        <label>Eyebrow da Seção</label>
                        <input
                          type="text"
                          value={homeContent.proposalsEyebrow || ""}
                          onChange={(e) =>
                            setHomeContent({
                              ...homeContent,
                              proposalsEyebrow: e.target.value,
                            })
                          }
                          placeholder="Bandeiras de campanha"
                        />
                      </div>

                      <div className="form-group">
                        <label>Título da Seção</label>
                        <input
                          type="text"
                          value={homeContent.proposalsTitle || ""}
                          onChange={(e) =>
                            setHomeContent({
                              ...homeContent,
                              proposalsTitle: e.target.value,
                            })
                          }
                          placeholder="Propostas para o Amazonas"
                        />
                      </div>

                      <div className="form-group form-group--span2">
                        <label>Subtítulo / Texto Explicativo</label>
                        <textarea
                          rows={2}
                          value={homeContent.proposalsSubtitle || ""}
                          onChange={(e) =>
                            setHomeContent({
                              ...homeContent,
                              proposalsSubtitle: e.target.value,
                            })
                          }
                          placeholder="Um plano de trabalho construído a partir da vivência no interior..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Lista de Propostas */}
                  <div className="admin-card">
                    <div className="admin-section-header" style={{ marginBottom: 16 }}>
                      <div>
                        <h3>Lista de Bandeiras & Propostas</h3>
                        <p>Adicione, remova ou altere as bandeiras de campanha de João Roberto.</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddProposal}
                        className="btn btn--secondary btn--sm"
                      >
                        ➕ Adicionar Nova Bandeira
                      </button>
                    </div>

                    <div className="admin-items-list">
                      {(homeContent.proposals || []).map((prop, index) => (
                        <div
                          key={index}
                          className={`admin-item-card ${prop.featured ? "is-featured-border" : ""}`}
                        >
                          <div className="admin-item-card-header">
                            <span className="badge-tag">Proposta #{index + 1}</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <label className="checkbox-featured-label">
                                <input
                                  type="checkbox"
                                  checked={Boolean(prop.featured)}
                                  onChange={(e) =>
                                    handleUpdateProposal(
                                      index,
                                      "featured",
                                      e.target.checked
                                    )
                                  }
                                />
                                🌟 Proposta Principal (Destaque Dourado)
                              </label>
                              <button
                                type="button"
                                onClick={() => handleDeleteProposal(index)}
                                className="btn-icon btn-icon--delete"
                                title="Remover proposta"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                          <div className="form-grid">
                            <div className="form-group form-group--span2">
                              <label>Título da Bandeira / Proposta</label>
                              <input
                                type="text"
                                value={prop.title}
                                onChange={(e) =>
                                  handleUpdateProposal(index, "title", e.target.value)
                                }
                                placeholder="Ex: Descentralização da saúde no Amazonas"
                              />
                            </div>
                            <div className="form-group form-group--span2">
                              <label>Descrição Completa da Proposta</label>
                              <textarea
                                rows={3}
                                value={prop.text}
                                onChange={(e) =>
                                  handleUpdateProposal(index, "text", e.target.value)
                                }
                                placeholder="Explicação detalhada da ação legislativa proposta..."
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB: COLIGAÇÃO */}
              {homeSectionTab === "coligacao" && (
                <div className="admin-card">
                  <div className="admin-card-section-title">
                    <h3>Força Política, Coligação & Dados Eleitorais</h3>
                    <p>Aliança partidária e informações oficiais de candidatura da urna.</p>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Eyebrow da Seção</label>
                      <input
                        type="text"
                        value={homeContent.coalitionEyebrow || ""}
                        onChange={(e) =>
                          setHomeContent({
                            ...homeContent,
                            coalitionEyebrow: e.target.value,
                          })
                        }
                        placeholder="Força política"
                      />
                    </div>

                    <div className="form-group">
                      <label>Título da Seção</label>
                      <input
                        type="text"
                        value={homeContent.coalitionTitle || ""}
                        onChange={(e) =>
                          setHomeContent({
                            ...homeContent,
                            coalitionTitle: e.target.value,
                          })
                        }
                        placeholder="Coligação Pra Cima, Amazonas"
                      />
                    </div>

                    <div className="form-group form-group--span2">
                      <label>Texto Explicativo da Coligação</label>
                      <textarea
                        rows={3}
                        value={homeContent.coalitionLede || ""}
                        onChange={(e) =>
                          setHomeContent({
                            ...homeContent,
                            coalitionLede: e.target.value,
                          })
                        }
                        placeholder="João Roberto integra a coligação encabeçada por David Almeida..."
                      />
                    </div>

                    <div className="form-group form-group--span2">
                      <label>Partidos da Coligação (Separados por vírgula)</label>
                      <input
                        type="text"
                        value={
                          homeContent.coalitionParties
                            ? homeContent.coalitionParties.join(", ")
                            : ""
                        }
                        onChange={(e) =>
                          setHomeContent({
                            ...homeContent,
                            coalitionParties: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                        placeholder="AVANTE, PDT, DC, PRD, SOLIDARIEDADE"
                      />
                    </div>

                    <div className="form-group">
                      <label>Estatística 1 - Valor / Número</label>
                      <input
                        type="text"
                        value={homeContent.coalitionStat1Num || ""}
                        onChange={(e) =>
                          setHomeContent({
                            ...homeContent,
                            coalitionStat1Num: e.target.value,
                          })
                        }
                        placeholder="70111"
                      />
                    </div>

                    <div className="form-group">
                      <label>Estatística 1 - Legenda</label>
                      <input
                        type="text"
                        value={homeContent.coalitionStat1Label || ""}
                        onChange={(e) =>
                          setHomeContent({
                            ...homeContent,
                            coalitionStat1Label: e.target.value,
                          })
                        }
                        placeholder="NÚMERO DE URNA — JOÃO ROBERTO"
                      />
                    </div>

                    <div className="form-group">
                      <label>Estatística 2 - Valor / Cargo</label>
                      <input
                        type="text"
                        value={homeContent.coalitionStat2Num || ""}
                        onChange={(e) =>
                          setHomeContent({
                            ...homeContent,
                            coalitionStat2Num: e.target.value,
                          })
                        }
                        placeholder="Deputado Estadual"
                      />
                    </div>

                    <div className="form-group">
                      <label>Estatística 2 - Legenda</label>
                      <input
                        type="text"
                        value={homeContent.coalitionStat2Label || ""}
                        onChange={(e) =>
                          setHomeContent({
                            ...homeContent,
                            coalitionStat2Label: e.target.value,
                          })
                        }
                        placeholder="CARGO PRETENDIDO — AMAZONAS"
                      />
                    </div>

                    <div className="form-group">
                      <label>Estatística 3 - Valor / Status TSE</label>
                      <input
                        type="text"
                        value={homeContent.coalitionStat3Num || ""}
                        onChange={(e) =>
                          setHomeContent({
                            ...homeContent,
                            coalitionStat3Num: e.target.value,
                          })
                        }
                        placeholder="Deferida"
                      />
                    </div>

                    <div className="form-group">
                      <label>Estatística 3 - Legenda</label>
                      <input
                        type="text"
                        value={homeContent.coalitionStat3Label || ""}
                        onChange={(e) =>
                          setHomeContent({
                            ...homeContent,
                            coalitionStat3Label: e.target.value,
                          })
                        }
                        placeholder="SITUAÇÃO DA CANDIDATURA (TSE)"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB: REDES SOCIAIS */}
              {homeSectionTab === "redes" && (
                <div className="admin-card">
                  <div className="admin-card-section-title">
                    <h3>Redes Sociais & Links Oficiais</h3>
                    <p>Links diretos para os canais de contato e mobilização da campanha.</p>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Eyebrow da Seção</label>
                      <input
                        type="text"
                        value={homeContent.socialEyebrow || ""}
                        onChange={(e) =>
                          setHomeContent({
                            ...homeContent,
                            socialEyebrow: e.target.value,
                          })
                        }
                        placeholder="Acompanhe e apoie"
                      />
                    </div>

                    <div className="form-group">
                      <label>Título da Seção</label>
                      <input
                        type="text"
                        value={homeContent.socialTitle || ""}
                        onChange={(e) =>
                          setHomeContent({ ...homeContent, socialTitle: e.target.value })
                        }
                        placeholder="Redes sociais"
                      />
                    </div>

                    <div className="form-group form-group--span2">
                      <label>Texto Subtítulo</label>
                      <textarea
                        rows={2}
                        value={homeContent.socialLede || ""}
                        onChange={(e) =>
                          setHomeContent({ ...homeContent, socialLede: e.target.value })
                        }
                        placeholder="Siga a campanha e fique por dentro das ações..."
                      />
                    </div>

                    <div className="form-group form-group--span2">
                      <label>Instagram Principal (@joaoroberto.am)</label>
                      <input
                        type="url"
                        value={homeContent.instagramMainUrl || ""}
                        onChange={(e) =>
                          setHomeContent({
                            ...homeContent,
                            instagramMainUrl: e.target.value,
                          })
                        }
                        placeholder="https://www.instagram.com/joaoroberto.am/"
                      />
                    </div>

                    <div className="form-group form-group--span2">
                      <label>Instagram da Campanha (@amazonascomjoaoroberto)</label>
                      <input
                        type="url"
                        value={homeContent.instagramSecondaryUrl || ""}
                        onChange={(e) =>
                          setHomeContent({
                            ...homeContent,
                            instagramSecondaryUrl: e.target.value,
                          })
                        }
                        placeholder="https://www.instagram.com/amazonascomjoaoroberto"
                      />
                    </div>

                    <div className="form-group form-group--span2">
                      <label>TikTok (@joaoviceprefeito)</label>
                      <input
                        type="url"
                        value={homeContent.tiktokUrl || ""}
                        onChange={(e) =>
                          setHomeContent({ ...homeContent, tiktokUrl: e.target.value })
                        }
                        placeholder="https://www.tiktok.com/@joaoviceprefeito"
                      />
                    </div>

                    <div className="form-group form-group--span2">
                      <label>Twibbonize / Moldura Oficial de Apoio</label>
                      <input
                        type="url"
                        value={homeContent.twibbonUrl || ""}
                        onChange={(e) =>
                          setHomeContent({ ...homeContent, twibbonUrl: e.target.value })
                        }
                        placeholder="https://www.twibbonize.com/joaoroberto70111depestadual"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB: CHAMADA FINAL */}
              {homeSectionTab === "final" && (
                <div className="admin-card">
                  <div className="admin-card-section-title">
                    <h3>Seção de Fechamento / Chamada Final de Voto</h3>
                    <p>Card azul escuro com chamada para votar no 70111 logo antes do rodapé.</p>
                  </div>

                  <div className="form-grid">
                    <div className="form-group form-group--span2">
                      <label>Título da Chamada Final</label>
                      <input
                        type="text"
                        value={homeContent.finalCtaTitle || ""}
                        onChange={(e) =>
                          setHomeContent({
                            ...homeContent,
                            finalCtaTitle: e.target.value,
                          })
                        }
                        placeholder="Vote 70111"
                      />
                    </div>

                    <div className="form-group form-group--span2">
                      <label>Texto da Chamada de Voto</label>
                      <textarea
                        rows={3}
                        value={homeContent.finalCtaText || ""}
                        onChange={(e) =>
                          setHomeContent({ ...homeContent, finalCtaText: e.target.value })
                        }
                        placeholder="João Roberto — Deputado Estadual pelo Amazonas..."
                      />
                    </div>

                    <div className="form-group">
                      <label>Texto do Botão de Ação</label>
                      <input
                        type="text"
                        value={homeContent.finalCtaBtnText || ""}
                        onChange={(e) =>
                          setHomeContent({
                            ...homeContent,
                            finalCtaBtnText: e.target.value,
                          })
                        }
                        placeholder="Seguir a campanha"
                      />
                    </div>

                    <div className="form-group">
                      <label>Link de Destino do Botão</label>
                      <input
                        type="url"
                        value={homeContent.finalCtaBtnUrl || ""}
                        onChange={(e) =>
                          setHomeContent({
                            ...homeContent,
                            finalCtaBtnUrl: e.target.value,
                          })
                        }
                        placeholder="https://www.instagram.com/joaoroberto.am/"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB: DADOS LEGAIS & RODAPÉ */}
              {homeSectionTab === "legal" && (
                <div className="admin-card">
                  <div className="admin-card-section-title">
                    <h3>Dados Eleitorais Oficiais & Rodapé (TSE)</h3>
                    <p>Informações de conformidade com a legislação eleitoral e prestação de contas.</p>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>CNPJ da Campanha Oficial</label>
                      <input
                        type="text"
                        value={homeContent.legalCnpj || ""}
                        onChange={(e) =>
                          setHomeContent({ ...homeContent, legalCnpj: e.target.value })
                        }
                        placeholder="68.404.127/0001-00"
                      />
                    </div>

                    <div className="form-group">
                      <label>Nome Oficial do Candidato</label>
                      <input
                        type="text"
                        value={homeContent.legalCandidateName || ""}
                        onChange={(e) =>
                          setHomeContent({
                            ...homeContent,
                            legalCandidateName: e.target.value,
                          })
                        }
                        placeholder="João Roberto"
                      />
                    </div>

                    <div className="form-group">
                      <label>Cargo Pretendido</label>
                      <input
                        type="text"
                        value={homeContent.legalOffice || ""}
                        onChange={(e) =>
                          setHomeContent({ ...homeContent, legalOffice: e.target.value })
                        }
                        placeholder="Deputado Estadual"
                      />
                    </div>

                    <div className="form-group">
                      <label>Ano Eleitoral</label>
                      <input
                        type="text"
                        value={homeContent.legalElectionYear || ""}
                        onChange={(e) =>
                          setHomeContent({
                            ...homeContent,
                            legalElectionYear: e.target.value,
                          })
                        }
                        placeholder="2026"
                      />
                    </div>

                    <div className="form-group form-group--span2">
                      <label>Nota Legal de Propaganda Eleitoral</label>
                      <textarea
                        rows={3}
                        value={homeContent.legalNote || ""}
                        onChange={(e) =>
                          setHomeContent({ ...homeContent, legalNote: e.target.value })
                        }
                        placeholder="Conteúdo de propaganda eleitoral na internet em conformidade com a Resolução TSE..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* BARRA DE AÇÃO FIXA / BOTTOM ACTIONS */}
              <div className="admin-home-footer-bar">
                <div className="footer-bar-info">
                  <span className="footer-bar-dot" />
                  <span>
                    Todas as abas são salvas juntas no Firestore e publicadas instantaneamente.
                  </span>
                </div>
                <div className="footer-bar-buttons">
                  <Link
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-site-preview"
                  >
                    👁️ Ver Site ao Vivo
                  </Link>
                  <button
                    type="submit"
                    className="btn btn-save-home"
                    disabled={isSaving}
                  >
                    {isSaving ? "Gravando no Firestore..." : "💾 Salvar Todas as Alterações"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
