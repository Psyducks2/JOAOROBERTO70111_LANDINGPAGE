import Image from "next/image";
import { SOCIAL_LINKS } from "./content";
import { getHomeContent } from "@/lib/posts";
import candidatePhoto from "../public/images/joao-roberto-foto-cutout.png";

export default async function Hero() {
  const home = await getHomeContent();
  const ledeText =
    home?.heroSubtitle ||
    "O vice-prefeito mais econômico do Amazonas agora candidato a Deputado Estadual. Uma trajetória de gestão austera em Lábrea e forte atuação no interior do Purus, agora a serviço de todo o Amazonas.";
  const twibbonLink = home?.twibbonUrl || SOCIAL_LINKS.twibbon;

  return (
    <section className="hero" id="topo">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">Eleições 2026 · Amazonas</span>
          <h1>
            João
            <br />
            Roberto
          </h1>
          <span className="hero-number">70111</span>
          <p className="hero-lede">{ledeText}</p>
          <div className="hero-ctas">
            <a
              className="btn btn--primary"
              href={SOCIAL_LINKS.instagramMain}
              target="_blank"
              rel="noopener noreferrer"
            >
              Seguir no Instagram
            </a>
            <a
              className="btn btn--ghost btn--on-hero"
              href={twibbonLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Apoiar a campanha
            </a>
          </div>
          <div className="hero-chips">
            <span className="chip">Partido AVANTE</span>
            <span className="chip">Coligação Pra Cima, Amazonas</span>
            <span className="chip">Candidatura deferida (TSE)</span>
          </div>
        </div>
        <div className="hero-photo-wrap">
          <Image
            className="hero-photo"
            src={candidatePhoto}
            alt="João Roberto, candidato a Deputado Estadual pelo Amazonas, sorrindo de braços cruzados, vestindo camisa azul"
            priority
            sizes="(min-width: 1024px) 500px, (min-width: 768px) 460px, 82vw"
          />
        </div>
      </div>
    </section>
  );
}
