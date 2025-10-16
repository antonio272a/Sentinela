export const runtime = "nodejs";
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

  const { energyScore, focusScore, emotionalBalanceScore, sleepQualityScore, notes } = body as {
    energyScore?: number;
    focusScore?: number;
    emotionalBalanceScore?: number;
    sleepQualityScore?: number;
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

  const values = [energyScore, focusScore, emotionalBalanceScore, sleepQualityScore];

  if (values.some((value) => typeof value !== "number" || Number.isNaN(value))) {
    return null;
  }

  return {
    energyScore: clampScore(energyScore!),
    focusScore: clampScore(focusScore!),
    emotionalBalanceScore: clampScore(emotionalBalanceScore!),
    sleepQualityScore: clampScore(sleepQualityScore!),
    notes: notes && typeof notes === "string" ? notes : null,
    date: normalizedTarget,
  };
}

function clampScore(value: number) {
  const normalized = Math.round(value);
  return Math.min(10, Math.max(0, normalized));
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

  const result = saveCheckInForDate(user.id, payload.date, {
    energyScore: payload.energyScore,
    focusScore: payload.focusScore,
    emotionalBalanceScore: payload.emotionalBalanceScore,
    sleepQualityScore: payload.sleepQualityScore,
    notes: payload.notes,
  });

  return NextResponse.json({ checkIn: result.checkIn, updated: result.wasUpdated }, { status: result.wasUpdated ? 200 : 201 });
}

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const checkIns = listCheckInsByUser(user.id);
  return NextResponse.json({ checkIns });
}
