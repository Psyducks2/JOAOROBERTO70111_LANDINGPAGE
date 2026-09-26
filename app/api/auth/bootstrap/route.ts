import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { DEFAULT_HOME_CONTENT, invalidateCache } from "@/lib/posts";

export async function POST() {
  const emailsToSeed = [
    process.env.ADMIN_DEFAULT_EMAIL || "admin@joaoroberto70111.com",
    "joaoroberto70111@joaoroberto70111.com",
  ];
  const password = process.env.ADMIN_DEFAULT_PASSWORD || "joaoroberto70111";

  const results: {
    usersSynced?: string[];
    mockPostsCleaned?: boolean;
    homeSeeded?: boolean;
    error?: string;
  } = { usersSynced: [] };

  // 1. Criar ou atualizar usuários no Firebase Auth
  if (adminAuth) {
    try {
      for (const email of emailsToSeed) {
        try {
          const user = await adminAuth.getUserByEmail(email);
          await adminAuth.updateUser(user.uid, {
            password: password,
            displayName: "João Roberto 70111",
          });
          results.usersSynced?.push(`updated: ${email}`);
        } catch {
          await adminAuth.createUser({
            email: email,
            password: password,
            displayName: "João Roberto 70111",
          });
          results.usersSynced?.push(`created: ${email}`);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("Bootstrap Auth notice:", msg);
      results.error = msg;
    }
  }

  // 2. Limpar postagens mockadas no Firestore
  if (adminDb) {
    try {
      const mockSlugs = [
        "compromisso-com-a-saude-nos-municipios-do-interior",
        "apoio-ao-produtor-rural-e-ao-escoamento-da-producao",
        "capacitacao-e-oportunidades-para-a-juventude-amazonense",
        "post-1",
        "post-2",
        "post-3",
      ];
      for (const slug of mockSlugs) {
        await adminDb.collection("posts").doc(slug).delete();
      }
      results.mockPostsCleaned = true;

      const homeDoc = await adminDb.collection("site_settings").doc("home").get();
      if (!homeDoc.exists) {
        await adminDb.collection("site_settings").doc("home").set(DEFAULT_HOME_CONTENT);
        results.homeSeeded = true;
      }
    } catch (err: unknown) {
      console.warn("Bootstrap Firestore notice:", err);
    }
  }

  invalidateCache();

  return NextResponse.json({
    success: true,
    message: "Ambiente configurado com sucesso e notícias mockadas removidas!",
    emails: emailsToSeed,
    details: results,
  });
}
