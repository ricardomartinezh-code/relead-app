import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserLinkPages, createLinkPage } from "@/lib/db/linkPages";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const pages = await getUserLinkPages(user.id);
  return NextResponse.json({ pages });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { internalName, slug, publicTitle, publicDescription, isDefault } = body;

    if (!internalName || !slug) {
      return NextResponse.json(
        { error: "internalName y slug son obligatorios" },
        { status: 400 }
      );
    }

    const page = await createLinkPage({
      userId: user.id,
      internalName,
      slug,
      publicTitle,
      publicDescription,
      isDefault,
    });

    return NextResponse.json({ page }, { status: 201 });
  } catch (error) {
    console.error("Error creando link_page:", error);
    return NextResponse.json(
      { error: "Error creando la página" },
      { status: 500 }
    );
  }
}
