import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { insertCheckIn, listCheckInsByUser } from "@/lib/checkIns";

function validatePayload(body: unknown) {
  if (!body || typeof body !== "object") {
    return null;
  }

  const { moodScore, stressScore, notes } = body as {
    moodScore?: number;
    stressScore?: number;
    notes?: string;
  };

  if (
    typeof moodScore !== "number" ||
    Number.isNaN(moodScore) ||
    typeof stressScore !== "number" ||
    Number.isNaN(stressScore)
  ) {
    return null;
  }

  return {
    moodScore: Math.max(1, Math.min(5, Math.round(moodScore))),
    stressScore: Math.max(1, Math.min(10, Math.round(stressScore))),
    notes: notes && typeof notes === "string" ? notes : null,
  };
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const payload = validatePayload(await request.json().catch(() => null));

  if (!payload) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const entry = insertCheckIn({
    userId: user.id,
    date: new Date().toISOString(),
    moodScore: payload.moodScore,
    stressScore: payload.stressScore,
    notes: payload.notes,
  });

  return NextResponse.json({ checkIn: entry }, { status: 201 });
}

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const checkIns = listCheckInsByUser(user.id);
  return NextResponse.json({ checkIns });
}
