import { SOCIAL_LINKS } from "./content";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="od-stack" style={{ ["--od-gap" as string]: "14px" }}>
            <div className="footer-brand">
              <span className="brand-number">70111</span>
              <span className="brand-name" style={{ color: "var(--white)" }}>
                João Roberto
              </span>
            </div>
            <nav className="footer-nav" aria-label="Navegação do rodapé">
              <a href="#sobre">Sobre</a>
              <a href="#propostas">Propostas</a>
              <a href="#coligacao">Coligação</a>
              <a href="#redes">Contato</a>
            </nav>
          </div>
          <div className="footer-social">
            <a href={SOCIAL_LINKS.instagramMain} target="_blank" rel="noopener noreferrer" aria-label="Instagram principal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            </a>
            <a href={SOCIAL_LINKS.instagramSecondary} target="_blank" rel="noopener noreferrer" aria-label="Instagram da campanha">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <path d="M8 12h8M8 16h5" />
              </svg>
            </a>
            <a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M14 4v9.5a3.5 3.5 0 1 1-3.5-3.5" />
                <path d="M14 4c0 2.5 2 4.5 4.5 4.5" />
              </svg>
            </a>
          </div>
        </div>
        <p className="legal">
          <strong>ELEIÇÕES 2026 · JOÃO ROBERTO · 70111</strong> — CNPJ
          68.404.127/0001-00 — Coligação &ldquo;Pra Cima, Amazonas&rdquo; —
          Partidos: AVANTE, PDT, DC, PRD e SOLIDARIEDADE.
          <br />
          Conteúdo de campanha eleitoral. Candidatura deferida pelo TSE. © 2026
          João Roberto 70111 — Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
