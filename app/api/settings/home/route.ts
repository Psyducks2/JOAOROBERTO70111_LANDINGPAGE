import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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
      ...current,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    if (adminDb) {
      await adminDb.collection("site_settings").doc("home").set(updated, { merge: true });
    }

    invalidateCache();

    try {
      revalidatePath("/");
    } catch (e) {
      console.warn("revalidatePath error:", e);
    }

    return NextResponse.json({ success: true, content: updated });
  } catch (error) {
    console.error("Erro ao salvar dados da Home:", error);
    return NextResponse.json({ error: "Falha ao salvar dados da Home" }, { status: 500 });
  }
}

