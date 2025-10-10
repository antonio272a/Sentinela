import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { listCheckInsByUser, saveCheckInForDate } from "@/lib/checkIns";

function normalizeToUTCDate(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function validatePayload(body: unknown) {
  if (!body || typeof body !== "object") {
    return null;
  }

  const { moodScore, stressScore, notes } = body as {
    moodScore?: number;
    stressScore?: number;
    notes?: string;
    date?: unknown;
  };

  let targetDate = new Date();
  if ("date" in (body as Record<string, unknown>) && (body as Record<string, unknown>).date !== undefined) {
    const rawDate = (body as { date?: unknown }).date;
    if (typeof rawDate !== "string") {
      return null;
    }

    const parsed = new Date(`${rawDate}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    targetDate = parsed;
  }

  const normalizedTarget = normalizeToUTCDate(targetDate);
  const today = normalizeToUTCDate(new Date());
  const earliestAllowed = new Date(today);
  earliestAllowed.setUTCDate(earliestAllowed.getUTCDate() - 7);

  if (normalizedTarget < earliestAllowed || normalizedTarget > today) {
    return null;
  }

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
    date: normalizedTarget,
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

  const result = saveCheckInForDate(
    user.id,
    payload.date,
    {
      moodScore: payload.moodScore,
      stressScore: payload.stressScore,
      notes: payload.notes,
    }
  );

  return NextResponse.json(
    { checkIn: result.checkIn, updated: result.wasUpdated },
    { status: result.wasUpdated ? 200 : 201 }
  );
}

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const checkIns = listCheckInsByUser(user.id);
  return NextResponse.json({ checkIns });
}
