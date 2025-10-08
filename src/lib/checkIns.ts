import {
  CheckInRecord,
  findLatestCheckIn,
  insertCheckIn,
  listCheckInsByUser,
  listCheckInsByUserSince,
} from "./db";

export type CheckInSummary = {
  recentCheckIns: CheckInRecord[];
  latest?: CheckInRecord;
  averageStress: number | null;
  averageMood: number | null;
  currentStreak: number;
};

function calculateAverage(values: number[]) {
  if (!values.length) return null;
  const total = values.reduce((acc, value) => acc + value, 0);
  return Math.round((total / values.length) * 10) / 10;
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
  const averageStress = calculateAverage(recentCheckIns.map((item) => item.stressScore));
  const averageMood = calculateAverage(recentCheckIns.map((item) => item.moodScore));
  const currentStreak = computeStreak(listCheckInsByUser(userId));

  return {
    recentCheckIns,
    latest,
    averageStress,
    averageMood,
    currentStreak,
  };
}

export { insertCheckIn, listCheckInsByUser };
