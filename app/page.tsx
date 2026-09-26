import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Proposals from "@/components/Proposals";
import Coalition from "@/components/Coalition";
import Social from "@/components/Social";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>

      <Header />

      <main id="conteudo">
        <Hero />
        <About />
        <Proposals />
        <Coalition />
        <Social />
        <FinalCta />
      </main>

      <Footer />
    </>
  );
}
