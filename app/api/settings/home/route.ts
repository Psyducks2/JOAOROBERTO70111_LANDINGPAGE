import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAdminRequest } from "@/lib/auth-helpers";
import { getHomeContent, invalidateCache } from "@/lib/posts";
import { HomeContent } from "@/lib/types";

export async function GET() {
  const content = await getHomeContent();
  return NextResponse.json(content);
}

export async function POST(request: NextRequest) {
  const isAuthorized = await verifyAdminRequest(request);
  if (!isAuthorized) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body: Partial<HomeContent> = await request.json();

    const current = await getHomeContent();
    const updated: HomeContent = {
      heroTagline: body.heroTagline ?? current.heroTagline,
      heroSubtitle: body.heroSubtitle ?? current.heroSubtitle,
      aboutHighlight: body.aboutHighlight ?? current.aboutHighlight,
      twibbonUrl: body.twibbonUrl ?? current.twibbonUrl,
      updatedAt: new Date().toISOString(),
    };

    if (adminDb) {
      await adminDb.collection("site_settings").doc("home").set(updated, { merge: true });
    }

    invalidateCache();

    return NextResponse.json({ success: true, content: updated });
  } catch (error) {
    console.error("Erro ao salvar dados da Home:", error);
    return NextResponse.json({ error: "Falha ao salvar dados da Home" }, { status: 500 });
  }
}
