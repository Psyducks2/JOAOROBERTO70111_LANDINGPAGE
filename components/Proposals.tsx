const PROPOSALS = [
  {
    featured: true,
    title: "Descentralização da saúde no Amazonas",
    text: "Criação de centros regionalizados de diagnóstico por imagem no interior, reduzindo a dependência de Manaus para exames e diagnósticos — a bandeira mais destacada da campanha.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },
  {
    title: "Fortalecimento do agronegócio",
    text: "Apoio à produção rural e ao produtor do interior do Amazonas, com foco em quem sustenta a economia do campo.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3c-4 3-6 6-6 9a6 6 0 0 0 12 0c0-3-2-6-6-9Z" />
        <path d="M12 12v9" />
      </svg>
    ),
  },
  {
    title: "Regularização fundiária",
    text: "Segurança jurídica da terra para famílias e produtores rurais do interior do Amazonas.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
    ),
  },
  {
    title: "Ampliação de ações sociais",
    text: "Mais programas e alcance de assistência social para as famílias que mais precisam.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
      </svg>
    ),
  },
  {
    title: "Defesa da causa autista",
    text: "Ampliação de políticas públicas de apoio a pessoas autistas e suas famílias.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M8.5 10.5c.5-1 1.8-1.5 3.5-1.5s3 .5 3.5 1.5M9 15c1 .8 2 1.2 3 1.2s2-.4 3-1.2" />
      </svg>
    ),
  },
];

export default function Proposals() {
  return (
    <section className="section proposals" id="propostas">
      <div className="container">
        <span className="eyebrow">Bandeiras de campanha</span>
        <h2 className="title">Propostas para o Amazonas</h2>
        <p className="lede">
          Um plano de trabalho construído a partir da vivência no interior, com
          foco em saúde, produção rural e inclusão social.
        </p>
        <div
          className="od-grid proposals-grid"
          style={{ ["--od-cols" as string]: 1, ["--od-gap" as string]: "24px" }}
        >
          {PROPOSALS.map((item) => (
            <article
              className={`proposal-card${item.featured ? " is-featured" : ""}`}
              key={item.title}
            >
              <div className="proposal-icon" aria-hidden="true">
                {item.icon}
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
