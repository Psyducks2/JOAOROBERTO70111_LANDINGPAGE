import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { DEFAULT_POSTS, DEFAULT_HOME_CONTENT } from "@/lib/posts";

export async function POST() {
  const email = process.env.ADMIN_DEFAULT_EMAIL || "admin@joaoroberto70111.com";
  const password = process.env.ADMIN_DEFAULT_PASSWORD || "joaoroberto70111";

  const results: {
    authCreated?: boolean;
    authUpdated?: boolean;
    postsSeeded?: number;
    homeSeeded?: boolean;
    error?: string;
  } = {};

  // 1. Criar ou atualizar usuário no Firebase Auth
  if (adminAuth) {
    try {
      let user;
      try {
        user = await adminAuth.getUserByEmail(email);
        await adminAuth.updateUser(user.uid, {
          password: password,
          displayName: "João Roberto 70111",
        });
        results.authUpdated = true;
      } catch {
        user = await adminAuth.createUser({
          email: email,
          password: password,
          displayName: "João Roberto 70111",
        });
        results.authCreated = true;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("Bootstrap Auth notice:", msg);
      results.error = msg;
    }
  }

  // 2. Criar postagens iniciais no Firestore se estiver vazio
  if (adminDb) {
    try {
      const postsSnapshot = await adminDb.collection("posts").limit(1).get();
      if (postsSnapshot.empty) {
        const batch = adminDb.batch();
        for (const post of DEFAULT_POSTS) {
          const docRef = adminDb.collection("posts").doc(post.slug);
          batch.set(docRef, { ...post, id: post.slug });
        }
        await batch.commit();
        results.postsSeeded = DEFAULT_POSTS.length;
      }

      const homeDoc = await adminDb.collection("site_settings").doc("home").get();
      if (!homeDoc.exists) {
        await adminDb.collection("site_settings").doc("home").set(DEFAULT_HOME_CONTENT);
        results.homeSeeded = true;
      }
    } catch (err: unknown) {
      console.warn("Bootstrap Firestore notice:", err);
    }
  }

  return NextResponse.json({
    success: true,
    message: "Ambiente configurado com sucesso!",
    email,
    details: results,
  });
}
