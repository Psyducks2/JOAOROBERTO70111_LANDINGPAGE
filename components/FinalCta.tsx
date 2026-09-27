import { SOCIAL_LINKS } from "./content";
import { HomeContent } from "@/lib/types";

interface FinalCtaProps {
  content?: HomeContent;
}

export default function FinalCta({ content }: FinalCtaProps) {
  const title = content?.finalCtaTitle || "Vote 70111";
  const text =
    content?.finalCtaText ||
    "João Roberto — Deputado Estadual pelo Amazonas. Uma trajetória de economia, trabalho no interior e compromisso com a saúde e o agronegócio.";
  const btnText = content?.finalCtaBtnText || "Seguir a campanha";
  const btnUrl =
    content?.finalCtaBtnUrl ||
    content?.instagramMainUrl ||
    SOCIAL_LINKS.instagramMain;

  return (
    <section className="final-cta">
      <div className="container final-cta-inner">
        <h2>{title}</h2>
        <p>{text}</p>
        <a
          className="btn btn--primary"
          href={btnUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {btnText}
        </a>
      </div>
    </section>
  );
}

