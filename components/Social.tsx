import { SOCIAL_LINKS } from "./content";

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M14 4v9.5a3.5 3.5 0 1 1-3.5-3.5" />
    <path d="M14 4c0 2.5 2 4.5 4.5 4.5" />
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M12 21s-7-4.6-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.4-9.5 9-9.5 9Z" />
  </svg>
);

const CARDS = [
  {
    href: SOCIAL_LINKS.instagramMain,
    icon: <InstagramIcon />,
    name: "Instagram principal",
    handle: "@joaoroberto.am",
    meta: "13,6 mil seguidores",
    verified: true,
  },
  {
    href: SOCIAL_LINKS.instagramSecondary,
    icon: <InstagramIcon />,
    name: "Instagram da campanha",
    handle: "@amazonascomjoaoroberto",
    meta: "Bastidores e agenda pelo interior",
  },
  {
    href: SOCIAL_LINKS.tiktok,
    icon: <TikTokIcon />,
    name: "TikTok",
    handle: "@joaoviceprefeito",
    meta: "Vídeos da rotina de campanha",
  },
  {
    href: SOCIAL_LINKS.twibbon,
    icon: <HeartIcon />,
    name: "Mostre seu apoio",
    handle: "Moldura de perfil oficial",
    meta: "Twibbonize · João Roberto 70111",
  },
];

export default function Social() {
  return (
    <section className="section social" id="redes">
      <div className="container">
        <span className="eyebrow">Acompanhe e apoie</span>
        <h2 className="title">Redes sociais</h2>
        <p className="lede">
          Siga a campanha e fique por dentro das ações de João Roberto pelo
          Amazonas.
        </p>
        <div
          className="od-grid social-grid"
          style={{ ["--od-cols" as string]: 1, ["--od-gap" as string]: "20px" }}
        >
          {CARDS.map((card) => (
            <a
              className="social-card"
              href={card.href}
              target="_blank"
              rel="noopener noreferrer"
              key={card.name}
            >
              <span className="social-icon" aria-hidden="true">
                {card.icon}
              </span>
              <span className="od-stack" style={{ ["--od-gap" as string]: "2px" }}>
                <span className="social-name">{card.name}</span>
                <span className="handle">{card.handle}</span>
                <span className="meta">{card.meta}</span>
                {card.verified && <span className="badge-verified">✓ Verificado</span>}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
