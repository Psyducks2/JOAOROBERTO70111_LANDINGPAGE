import Image from "next/image";
import { SOCIAL_LINKS } from "./content";
import { getHomeContent } from "@/lib/posts";
import candidatePhoto from "../public/images/joao-roberto-foto-cutout.png";
import { HomeContent } from "@/lib/types";

interface HeroProps {
  content?: HomeContent;
}

export default async function Hero({ content }: HeroProps) {
  const home = content || (await getHomeContent());
  const eyebrow = home.heroEyebrow || "Eleições 2026 · Amazonas";
  const candidateName = home.heroCandidateName || "João\nRoberto";
  const number = home.heroNumber || "70111";
  const ledeText =
    home.heroSubtitle ||
    "O vice-prefeito mais econômico do Amazonas agora candidato a Deputado Estadual. Uma trajetória de gestão austera em Lábrea e forte atuação no interior do Purus, agora a serviço de todo o Amazonas.";
  const primaryBtnText = home.heroPrimaryBtnText || "Seguir no Instagram";
  const primaryBtnUrl = home.heroPrimaryBtnUrl || SOCIAL_LINKS.instagramMain;
  const secondaryBtnText = home.heroSecondaryBtnText || "Apoiar a campanha";
  const secondaryBtnUrl =
    home.heroSecondaryBtnUrl || home.twibbonUrl || SOCIAL_LINKS.twibbon;
  const chip1 = home.heroChip1 || "Partido AVANTE";
  const chip2 = home.heroChip2 || "Coligação Pra Cima, Amazonas";
  const chip3 = home.heroChip3 || "Candidatura deferida (TSE)";

  // Format name with line break if contains space or newline
  const nameParts = candidateName.includes("\n")
    ? candidateName.split("\n")
    : candidateName.split(" ");

  return (
    <section className="hero" id="topo">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">{eyebrow}</span>
          <h1>
            {nameParts.map((part, index) => (
              <span key={index}>
                {part}
                {index < nameParts.length - 1 && <br />}
              </span>
            ))}
          </h1>
          <span className="hero-number">{number}</span>
          <p className="hero-lede">{ledeText}</p>
          <div className="hero-ctas">
            <a
              className="btn btn--primary"
              href={primaryBtnUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {primaryBtnText}
            </a>
            <a
              className="btn btn--ghost btn--on-hero"
              href={secondaryBtnUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {secondaryBtnText}
            </a>
          </div>
          <div className="hero-chips">
            {chip1 && <span className="chip">{chip1}</span>}
            {chip2 && <span className="chip">{chip2}</span>}
            {chip3 && <span className="chip">{chip3}</span>}
          </div>
        </div>
        <div className="hero-photo-wrap">
          <Image
            className="hero-photo"
            src={candidatePhoto}
            alt={`${candidateName}, candidato a Deputado Estadual pelo Amazonas, sorrindo de braços cruzados, vestindo camisa azul`}
            priority
            sizes="(min-width: 1024px) 500px, (min-width: 768px) 460px, 82vw"
          />
        </div>
      </div>
    </section>
  );
}

