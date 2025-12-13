import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAnalyticsOverviewForClerkUserId } from "@/lib/analytics";

export async function GET() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const data = await getAnalyticsOverviewForClerkUserId(clerkUserId);
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error cargando analíticas";
    const status = message.includes("no encontrado") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export const dynamic = "force-dynamic";
