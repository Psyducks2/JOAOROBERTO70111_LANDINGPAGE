import { NextRequest, NextResponse } from "next/server";
import { adminStorage } from "@/lib/firebase-admin";
import { verifyAdminRequest } from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
  const isAuthorized = await verifyAdminRequest(request);
  if (!isAuthorized) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitiza o nome do arquivo
    const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `blog/${Date.now()}_${originalName}`;
    const contentType = file.type || "image/jpeg";

    const bucketName =
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
      "joaoroberto70111-5f51e.firebasestorage.app";

    if (adminStorage) {
      const bucket = adminStorage.bucket(bucketName);
      const fileRef = bucket.file(filename);

      await fileRef.save(buffer, {
        metadata: {
          contentType,
        },
      });

      // Tenta tornar público
      try {
        await fileRef.makePublic();
      } catch (pubErr) {
        console.warn("Could not makePublic (uniform bucket-level access might be on):", pubErr);
      }

      // URL pública acessível via CDN do Firebase Storage
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(
        filename
      )}?alt=media`;

      return NextResponse.json({ url: publicUrl, filename });
    }

    return NextResponse.json({ error: "Storage não configurado" }, { status: 500 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Erro no upload para Firebase Storage:", error);
    return NextResponse.json(
      { error: "Falha ao processar upload", details: message },
      { status: 500 }
    );
  }
}
