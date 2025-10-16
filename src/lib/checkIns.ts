import {
  CheckInRecord,
  findLatestCheckIn,
  findCheckInByUserAndDateRange,
  insertCheckIn,
  listCheckInsByUser,
  listCheckInsByUserSince,
  updateCheckIn as updateCheckInRecord,
} from "./db";

export type CheckInSummary = {
  recentCheckIns: CheckInRecord[];
  latest?: CheckInRecord;
  averages: {
    energy: number | null;
    focus: number | null;
    emotionalBalance: number | null;
    sleep: number | null;
  };
  currentStreak: number;
};

function calculateAverage(values: readonly number[] | null | undefined) {
  const numericValues = Array.isArray(values)
    ? values.filter((value): value is number => typeof value === "number")
    : [];

  if (numericValues.length === 0) {
    return null;
  }

  const total = numericValues.reduce((acc, value) => acc + value, 0);
  return Math.round((total / numericValues.length) * 10) / 10;
}

function computeStreak(checkIns: CheckInRecord[]) {
  if (!checkIns.length) return 0;
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const entry of checkIns) {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);

    const diffInDays = Math.round(
      (currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === streak) {
      streak += 1;
    } else if (diffInDays > streak) {
      break;
    }
  }

  return streak;
}

export function getDashboardSummary(userId: string): CheckInSummary {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentCheckIns = listCheckInsByUserSince(userId, thirtyDaysAgo.toISOString());
  const latest = findLatestCheckIn(userId);
  const currentStreak = computeStreak(listCheckInsByUser(userId));

  return {
    recentCheckIns,
    latest,
    averages: {
      energy: calculateAverage(recentCheckIns.map((item) => item.energyScore)),
      focus: calculateAverage(recentCheckIns.map((item) => item.focusScore)),
      emotionalBalance: calculateAverage(
        recentCheckIns.map((item) => item.emotionalBalanceScore)
      ),
      sleep: calculateAverage(recentCheckIns.map((item) => item.sleepQualityScore)),
    },
    currentStreak,
  };
}

export function getCheckInForDate(
  userId: string | number,
  reference: Date
): CheckInRecord | undefined {
  const bounds = getDayBounds(reference);

  return findCheckInByUserAndDateRange(
    userId,
    bounds.start.toISOString(),
    bounds.end.toISOString()
  );
}

export function getTodayCheckIn(userId: string | number): CheckInRecord | undefined {
  return getCheckInForDate(userId, new Date());
}

export function saveCheckInForDate(
  userId: string | number,
  reference: Date,
  payload: {
    energyScore: number;
    focusScore: number;
    emotionalBalanceScore: number;
    sleepQualityScore: number;
    notes: string | null;
  }
): { checkIn: CheckInRecord; wasUpdated: boolean } {
  const bounds = getDayBounds(reference);
  const existing = findCheckInByUserAndDateRange(
    userId,
    bounds.start.toISOString(),
    bounds.end.toISOString()
  );

  if (existing) {
    const updated = updateCheckInRecord({
      id: existing.id,
      energyScore: payload.energyScore,
      focusScore: payload.focusScore,
      emotionalBalanceScore: payload.emotionalBalanceScore,
      sleepQualityScore: payload.sleepQualityScore,
      notes: payload.notes,
    });

    return { checkIn: updated, wasUpdated: true };
  }

  const entry = insertCheckIn({
    userId,
    date: bounds.start.toISOString(),
    energyScore: payload.energyScore,
    focusScore: payload.focusScore,
    emotionalBalanceScore: payload.emotionalBalanceScore,
    sleepQualityScore: payload.sleepQualityScore,
    notes: payload.notes,
  });

  return { checkIn: entry, wasUpdated: false };
}

export function saveCheckInForToday(
  userId: string | number,
  payload: {
    energyScore: number;
    focusScore: number;
    emotionalBalanceScore: number;
    sleepQualityScore: number;
    notes: string | null;
  }
): { checkIn: CheckInRecord; wasUpdated: boolean } {
  return saveCheckInForDate(userId, new Date(), payload);
}

export { listCheckInsByUser };

function getDayBounds(reference: Date) {
  const start = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), reference.getUTCDate()));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return { start, end };
}
