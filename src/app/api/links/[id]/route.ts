import { getSession } from "@/lib/auth";
import { deleteLink, findLinkById, getUserWithProfileByEmail, updateLink } from "@/lib/mockDb";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.user?.email) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const user = getUserWithProfileByEmail(session.user.email);
  if (!user?.profile) return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });

  const body = await req.json();
  const { label, url, order, isActive } = body ?? {};

  const existing = findLinkById(params.id);
  if (!existing || existing.profileId !== user.profile.id) {
    return NextResponse.json({ error: "Link no encontrado" }, { status: 404 });
  }

  const updated = updateLink(params.id, {
    label,
    url,
    order,
    isActive,
  });

  if (!updated) return NextResponse.json({ error: "Link no encontrado" }, { status: 404 });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.user?.email) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const user = getUserWithProfileByEmail(session.user.email);
  if (!user?.profile) return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });

  const existing = findLinkById(params.id);
  if (!existing || existing.profileId !== user.profile.id) return NextResponse.json({ error: "Link no encontrado" }, { status: 404 });

  const success = deleteLink(params.id);
  if (!success) return NextResponse.json({ error: "Link no encontrado" }, { status: 404 });

  return NextResponse.json({ success: true });
}
