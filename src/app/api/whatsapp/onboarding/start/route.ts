import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

import { getCurrentUser } from "@/lib/auth";
import { createOrReuseWhatsAppOnboardingSession } from "@/lib/db";

type RequestBody = {
  config_id?: string | null;
  redirect_uri?: string | null;
};

function makeState() {
  return randomBytes(16).toString("hex");
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: RequestBody = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const configId = typeof body.config_id === "string" ? body.config_id : null;
  const redirectUri =
    typeof body.redirect_uri === "string" ? body.redirect_uri : null;

  const { session, reused } = await createOrReuseWhatsAppOnboardingSession({
    userId: user.id,
    state: makeState(),
    configId,
    redirectUri,
  });

  const response = NextResponse.json({
    session: {
      id: session.id,
      state: session.state,
      reused,
      config_id: session.configId ?? null,
      redirect_uri: session.redirectUri ?? null,
      status: session.status,
    },
  });

  response.cookies.set({
    name: "wa_es_state",
    value: encodeURIComponent(session.state),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 30,
  });

  return response;
}

