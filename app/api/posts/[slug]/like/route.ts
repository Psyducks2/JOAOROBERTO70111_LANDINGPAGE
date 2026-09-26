import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json({ error: "Slug inválido" }, { status: 400 });
    }

    if (adminDb) {
      const docRef = adminDb.collection("posts").doc(slug);
      await docRef.set(
        {
          likes: FieldValue.increment(1),
        },
        { merge: true }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao registrar like:", error);
    return NextResponse.json({ error: "Erro ao registrar curtida" }, { status: 500 });
  }
}
