const PARTIES = ["AVANTE", "PDT", "DC", "PRD", "SOLIDARIEDADE"];

export default function Coalition() {
  return (
    <section className="section coalition" id="coligacao">
      <div className="container coalition-grid">
        <div>
          <span className="eyebrow">Força política</span>
          <h2 className="title">Coligação Pra Cima, Amazonas</h2>
          <p className="coalition-lede">
            João Roberto integra a coligação encabeçada por{" "}
            <strong>David Almeida</strong>, candidato a governador do Amazonas,
            unindo cinco partidos em torno de um mesmo projeto para o estado.
          </p>
          <div className="party-list">
            {PARTIES.map((party) => (
              <span className="party-chip" key={party}>
                {party}
              </span>
            ))}
          </div>
        </div>
        <div className="coalition-card">
          <div className="coalition-stat">
            <span className="num">70111</span>
            <span className="lbl">NÚMERO DE URNA — JOÃO ROBERTO</span>
          </div>
          <div className="coalition-stat">
            <span className="num">Deputado Estadual</span>
            <span className="lbl">CARGO PRETENDIDO — AMAZONAS</span>
          </div>
          <div className="coalition-stat">
            <span className="num">Deferida</span>
            <span className="lbl">SITUAÇÃO DA CANDIDATURA (TSE)</span>
          </div>
        </div>
      </div>
    </section>
  );
}
