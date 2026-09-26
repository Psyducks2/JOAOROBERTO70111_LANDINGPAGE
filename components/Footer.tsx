"use client";

import { useState } from "react";
import Link from "next/link";
import { SOCIAL_LINKS, CAMPAIGN_INFO } from "./content";

export default function Footer() {
  const [copied, setCopied] = useState(false);

  const handleCopyCnpj = async () => {
    try {
      await navigator.clipboard.writeText(CAMPAIGN_INFO.cnpj);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = CAMPAIGN_INFO.cnpj;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="od-stack" style={{ ["--od-gap" as string]: "14px" }}>
            <div className="footer-brand">
              <span className="brand-number">{CAMPAIGN_INFO.number}</span>
              <span className="brand-name" style={{ color: "var(--white)" }}>
                {CAMPAIGN_INFO.candidateName}
              </span>
            </div>
            <nav className="footer-nav" aria-label="Navegação do rodapé">
              <Link href="/#sobre">Sobre</Link>
              <Link href="/#propostas">Propostas</Link>
              <Link href="/blog">Blog</Link>
              <Link href="/#coligacao">Coligação</Link>
              <Link href="/#redes">Contato</Link>
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

        {/* Card em destaque com CNPJ e transparência eleitoral */}
        <section className="legal-card" aria-label="Dados oficiais e transparência da campanha">
          <div className="legal-card-header">
            <div className="legal-badges">
              <span className="badge-official">ELEIÇÕES {CAMPAIGN_INFO.electionYear}</span>
              <span className="badge-deferida">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {CAMPAIGN_INFO.tseStatus}
              </span>
            </div>

            <div className="legal-cnpj-container">
              <span className="legal-cnpj-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                CNPJ DA CAMPANHA
              </span>
              <div className="legal-cnpj-action-group">
                <code className="legal-cnpj-number" id="campaign-cnpj" title="CNPJ oficial de campanha">
                  {CAMPAIGN_INFO.cnpj}
                </code>
                <button
                  type="button"
                  onClick={handleCopyCnpj}
                  className={`btn-copy-cnpj ${copied ? "is-copied" : ""}`}
                  aria-label={copied ? "CNPJ copiado com sucesso" : "Copiar número do CNPJ"}
                >
                  {copied ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      <span>Copiar CNPJ</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="legal-card-details">
            <p className="legal-candidate">
              <strong>{CAMPAIGN_INFO.candidateName.toUpperCase()}</strong> — Candidato a {CAMPAIGN_INFO.office} · Número <strong>{CAMPAIGN_INFO.number}</strong>
            </p>
            <p className="legal-coalition">
              Coligação &ldquo;{CAMPAIGN_INFO.coalitionName}&rdquo; — Partidos: <strong>{CAMPAIGN_INFO.parties.join(", ")}</strong>.
            </p>
          </div>

          <div className="legal-card-footer">
            <p>
              Conteúdo de propaganda eleitoral na internet em conformidade com a Resolução TSE nº 23.610/2019 e Lei nº 9.504/1997.
              <br />
              © {CAMPAIGN_INFO.electionYear} {CAMPAIGN_INFO.candidateName} {CAMPAIGN_INFO.number} — Todos os direitos reservados.
            </p>
          </div>
        </section>
      </div>
    </footer>
  );
}
