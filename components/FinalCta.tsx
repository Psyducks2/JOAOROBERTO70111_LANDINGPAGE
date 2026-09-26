import { SOCIAL_LINKS } from "./content";

export default function FinalCta() {
  return (
    <section className="final-cta">
      <div className="container final-cta-inner">
        <h2>Vote 70111</h2>
        <p>
          João Roberto — Deputado Estadual pelo Amazonas. Uma trajetória de
          economia, trabalho no interior e compromisso com a saúde e o
          agronegócio.
        </p>
        <a
          className="btn btn--primary"
          href={SOCIAL_LINKS.instagramMain}
          target="_blank"
          rel="noopener noreferrer"
        >
          Seguir a campanha
        </a>
      </div>
    </section>
  );
}
