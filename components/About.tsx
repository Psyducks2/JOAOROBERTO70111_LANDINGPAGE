import { HomeContent } from "@/lib/types";

interface AboutProps {
  content?: HomeContent;
}

const DEFAULT_TIMELINE = [
  {
    title: "Vice-prefeito de Lábrea",
    text: "Gestão reconhecida pela economia de recursos públicos e pela atuação próxima da população do interior.",
  },
  {
    title: "Saída do Podemos — abril de 2026",
    text: "Deixou o partido e renunciou ao cargo de vice-prefeito para se desincompatibilizar e concorrer nas eleições de 2026.",
  },
  {
    title: "Filiação ao AVANTE",
    text: 'Passa a integrar a coligação "Pra Cima, Amazonas", encabeçada pelo candidato a governador David Almeida.',
  },
  {
    title: "Candidato a Deputado Estadual — 70111",
    text: "Candidatura deferida pelo TSE, levando a experiência do interior para a Assembleia Legislativa do Amazonas.",
  },
];

export default function About({ content }: AboutProps) {
  const eyebrow = content?.aboutEyebrow || "Quem é João Roberto";
  const title =
    content?.aboutTitle || "Contador, gestor público e liderança do interior";
  const paragraph1 = content?.aboutParagraph1;
  const paragraph2 = content?.aboutParagraph2;
  const timeline =
    content?.timeline && content.timeline.length > 0
      ? content.timeline
      : DEFAULT_TIMELINE;

  return (
    <section className="section about" id="sobre">
      <div className="container about-grid">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h2 className="title">{title}</h2>
          <div className="about-card" style={{ marginTop: 24 }}>
            {paragraph1 ? (
              <p>{paragraph1}</p>
            ) : (
              <p>
                Natural de <strong>Lábrea</strong>, no Amazonas, João Roberto é
                contador de formação e construiu sua trajetória política como{" "}
                <strong>vice-prefeito de Lábrea</strong>, onde ficou conhecido por
                uma gestão marcada pela austeridade e pelo baixo uso de recursos
                públicos — o que lhe rendeu o apelido de{" "}
                <strong>&ldquo;o vice-prefeito mais econômico do Amazonas&rdquo;</strong>.
              </p>
            )}
            {paragraph2 ? (
              <p>{paragraph2}</p>
            ) : (
              <p>
                Sua atuação discreta e comprometida no interior construiu uma base
                política forte na região do <strong>Purus</strong> e no sul do
                estado, com boa avaliação popular pela visibilidade regional que
                trouxe a essas comunidades.
              </p>
            )}
          </div>
        </div>
        <div className="timeline">
          {timeline.map((item, idx) => (
            <div className="timeline-item" key={item.title + idx}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

