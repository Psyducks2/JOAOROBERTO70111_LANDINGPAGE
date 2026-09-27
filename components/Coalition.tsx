import { HomeContent } from "@/lib/types";

interface CoalitionProps {
  content?: HomeContent;
}

const DEFAULT_PARTIES = ["AVANTE", "PDT", "DC", "PRD", "SOLIDARIEDADE"];

export default function Coalition({ content }: CoalitionProps) {
  const eyebrow = content?.coalitionEyebrow || "Força política";
  const title = content?.coalitionTitle || "Coligação Pra Cima, Amazonas";
  const lede =
    content?.coalitionLede ||
    'João Roberto integra a coligação encabeçada por David Almeida, candidato a governador do Amazonas, unindo cinco partidos em torno de um mesmo projeto para o estado.';
  const parties =
    content?.coalitionParties && content.coalitionParties.length > 0
      ? content.coalitionParties
      : DEFAULT_PARTIES;
  const stat1Num = content?.coalitionStat1Num || "70111";
  const stat1Label =
    content?.coalitionStat1Label || "NÚMERO DE URNA — JOÃO ROBERTO";
  const stat2Num = content?.coalitionStat2Num || "Deputado Estadual";
  const stat2Label =
    content?.coalitionStat2Label || "CARGO PRETENDIDO — AMAZONAS";
  const stat3Num = content?.coalitionStat3Num || "Deferida";
  const stat3Label =
    content?.coalitionStat3Label || "SITUAÇÃO DA CANDIDATURA (TSE)";

  return (
    <section className="section coalition" id="coligacao">
      <div className="container coalition-grid">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h2 className="title">{title}</h2>
          <p className="coalition-lede">{lede}</p>
          <div className="party-list">
            {parties.map((party) => (
              <span className="party-chip" key={party}>
                {party}
              </span>
            ))}
          </div>
        </div>
        <div className="coalition-card">
          <div className="coalition-stat">
            <span className="num">{stat1Num}</span>
            <span className="lbl">{stat1Label}</span>
          </div>
          <div className="coalition-stat">
            <span className="num">{stat2Num}</span>
            <span className="lbl">{stat2Label}</span>
          </div>
          <div className="coalition-stat">
            <span className="num">{stat3Num}</span>
            <span className="lbl">{stat3Label}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

