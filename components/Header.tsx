"use client";

import { useEffect, useState } from "react";
import { SOCIAL_LINKS, CAMPAIGN_INFO } from "./content";

const NAV_LINKS = [
  { href: "/#sobre", label: "Sobre" },
  { href: "/#propostas", label: "Propostas" },
  { href: "/blog", label: "Blog" },
  { href: "/#coligacao", label: "Coligação" },
  { href: "/#redes", label: "Contato" },
];

const RIBBON_ITEMS = Array.from({ length: 8 });

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyCnpj = async () => {
    try {
      await navigator.clipboard.writeText(CAMPAIGN_INFO.cnpj);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = CAMPAIGN_INFO.cnpj;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    document.body.classList.toggle("menu-open", isMenuOpen);
  }, [isMenuOpen]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsMenuOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <div className="ribbon" aria-hidden="true">
        <div className="ribbon-track">
          {RIBBON_ITEMS.map((_, i) => (
            <span key={i} style={{ display: "contents" }}>
              <span className={`pill ${i % 2 === 0 ? "pill--blue" : "pill--orange"}`}>
                JOÃO ROBERTO
              </span>
              <span className={`pill ${i % 2 === 0 ? "pill--orange" : "pill--blue"}`}>
                70111
              </span>
              <span className="pill pill--cnpj">
                CNPJ {CAMPAIGN_INFO.cnpj}
              </span>
            </span>
          ))}
        </div>
      </div>

      <header className="site-header">
        <div className="container">
          <a className="brand" href="#topo" aria-label="João Roberto 70111 — início">
            <span className="brand-number">70111</span>
            <span className="brand-name">João Roberto</span>
          </a>

          <nav className="nav-desktop" aria-label="Navegação principal">
            <ul>
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="header-actions">
            <a
              className="btn btn--primary btn--sm"
              href={SOCIAL_LINKS.twibbon}
              target="_blank"
              rel="noopener noreferrer"
            >
              Apoiar 70111
            </a>
            <button
              className="nav-toggle"
              type="button"
              aria-expanded={isMenuOpen}
              aria-controls="menu-mobile"
              aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              {isMenuOpen ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <nav
        className={`mobile-menu${isMenuOpen ? " is-open" : ""}`}
        id="menu-mobile"
        aria-label="Menu mobile"
        aria-hidden={!isMenuOpen}
      >
        <div className="od-stack" style={{ ["--od-gap" as string]: 0 }}>
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)}>
              {link.label}
            </a>
          ))}
          <a
            href={SOCIAL_LINKS.twibbon}
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginTop: 20, color: "var(--orange)" }}
            onClick={() => setIsMenuOpen(false)}
          >
            Apoiar a campanha →
          </a>

          <div className="mobile-menu-cnpj" aria-label="Identificação do candidato e CNPJ">
            <div className="mobile-menu-cnpj-badge">
              <span className="badge-tag">DADOS DA CANDIDATURA</span>
              <span className="badge-status">ELEIÇÕES {CAMPAIGN_INFO.electionYear}</span>
            </div>

            <div className="mobile-menu-cnpj-content">
              <div className="mobile-menu-cnpj-info">
                <span className="mobile-menu-cnpj-label">CNPJ DA CAMPANHA</span>
                <span className="mobile-menu-cnpj-number">{CAMPAIGN_INFO.cnpj}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyCnpj}
                className={`mobile-menu-copy-btn ${copied ? "is-copied" : ""}`}
                aria-label={copied ? "CNPJ copiado com sucesso" : "Copiar CNPJ da campanha"}
              >
                {copied ? (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>

            <p className="mobile-menu-cnpj-desc">
              <strong>{CAMPAIGN_INFO.candidateName.toUpperCase()} ({CAMPAIGN_INFO.number})</strong> — {CAMPAIGN_INFO.office}
              <br />
              Coligação &ldquo;{CAMPAIGN_INFO.coalitionName}&rdquo;
            </p>
          </div>
        </div>
      </nav>
    </>
  );
}
