import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAdminRequest } from "@/lib/auth-helpers";
import { invalidateCache, getPublishedPosts, getAllPostsAdmin } from "@/lib/posts";
import { BlogPost } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const isAdmin = searchParams.get("admin") === "true";

  if (isAdmin) {
    const isAuthorized = await verifyAdminRequest(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const posts = await getAllPostsAdmin();
    return NextResponse.json(posts);
  }

  const posts = await getPublishedPosts();
  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  const isAuthorized = await verifyAdminRequest(request);
  if (!isAuthorized) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body: Partial<BlogPost> = await request.json();

    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: "Título e conteúdo são obrigatórios" },
        { status: 400 }
      );
    }

    const slug =
      body.slug ||
      body.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const postData: BlogPost = {
      id: body.id || slug,
      title: body.title,
      slug,
      summary: body.summary || body.content.slice(0, 150) + "...",
      content: body.content,
      coverImage: body.coverImage || "",
      category: body.category || "Geral",
      publishedAt: body.publishedAt || new Date().toISOString().split("T")[0],
      likes: typeof body.likes === "number" ? body.likes : 0,
      featured: Boolean(body.featured),
      status: body.status || "published",
      updatedAt: new Date().toISOString(),
    };

    if (adminDb) {
      await adminDb.collection("posts").doc(postData.slug).set(postData, { merge: true });
    }

    invalidateCache();

    return NextResponse.json({ success: true, post: postData });
  } catch (error) {
    console.error("Erro ao salvar post:", error);
    return NextResponse.json({ error: "Falha ao salvar postagem" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const isAuthorized = await verifyAdminRequest(request);
  if (!isAuthorized) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    if (adminDb) {
      await adminDb.collection("posts").doc(id).delete();
    }

    invalidateCache();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir post:", error);
    return NextResponse.json({ error: "Falha ao excluir postagem" }, { status: 500 });
  }
}
