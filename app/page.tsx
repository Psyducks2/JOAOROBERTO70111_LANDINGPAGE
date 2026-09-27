import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Proposals from "@/components/Proposals";
import BlogSection from "@/components/BlogSection";
import Coalition from "@/components/Coalition";
import Social from "@/components/Social";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";
import AdminHomeBar from "@/components/AdminHomeBar";
import { getHomeContent } from "@/lib/posts";

export default async function Home() {
  const home = await getHomeContent();

  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>

      <AdminHomeBar />
      <Header />

      <main id="conteudo">
        <Hero content={home} />
        <About content={home} />
        <Proposals content={home} />
        <BlogSection />
        <Coalition content={home} />
        <Social content={home} />
        <FinalCta content={home} />
      </main>

      <Footer content={home} />
    </>
  );
}


