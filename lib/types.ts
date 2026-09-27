export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage?: string;
  category: string;
  publishedAt: string;
  likes: number;
  featured?: boolean;
  status: "published" | "draft";
  updatedAt?: string;
}

export interface TimelineItem {
  title: string;
  text: string;
}

export interface ProposalItem {
  title: string;
  text: string;
  featured?: boolean;
}

export interface HomeContent {
  // Hero
  heroEyebrow?: string;
  heroCandidateName?: string;
  heroNumber?: string;
  heroTagline?: string;
  heroSubtitle?: string;
  heroPrimaryBtnText?: string;
  heroPrimaryBtnUrl?: string;
  heroSecondaryBtnText?: string;
  heroSecondaryBtnUrl?: string;
  heroChip1?: string;
  heroChip2?: string;
  heroChip3?: string;

  // Sobre
  aboutEyebrow?: string;
  aboutTitle?: string;
  aboutParagraph1?: string;
  aboutParagraph2?: string;
  aboutHighlight?: string;
  timeline?: TimelineItem[];

  // Propostas / Bandeiras
  proposalsEyebrow?: string;
  proposalsTitle?: string;
  proposalsSubtitle?: string;
  proposals?: ProposalItem[];

  // Coligação
  coalitionEyebrow?: string;
  coalitionTitle?: string;
  coalitionLede?: string;
  coalitionParties?: string[];
  coalitionStat1Num?: string;
  coalitionStat1Label?: string;
  coalitionStat2Num?: string;
  coalitionStat2Label?: string;
  coalitionStat3Num?: string;
  coalitionStat3Label?: string;

  // Redes Sociais & Links
  socialEyebrow?: string;
  socialTitle?: string;
  socialLede?: string;
  instagramMainUrl?: string;
  instagramSecondaryUrl?: string;
  tiktokUrl?: string;
  twibbonUrl?: string;

  // Chamada Final (Vote 70111)
  finalCtaTitle?: string;
  finalCtaText?: string;
  finalCtaBtnText?: string;
  finalCtaBtnUrl?: string;

  // Dados Oficiais / Rodapé
  legalCnpj?: string;
  legalCandidateName?: string;
  legalOffice?: string;
  legalElectionYear?: string;
  legalNote?: string;

  updatedAt?: string;
}
