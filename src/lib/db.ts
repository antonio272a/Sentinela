import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

export type CheckInRecord = {
  id: number;
  userId: string;
  date: string;
  moodScore: number;
  stressScore: number;
  notes: string | null;
};

const globalForDb = globalThis as unknown as {
  _sentinelaDb?: Database.Database;
};

function createDatabaseInstance() {
  const databasePath =
    process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "sentinela.db");

  fs.mkdirSync(path.dirname(databasePath), { recursive: true });

  const instance = new Database(databasePath);
  instance.pragma("journal_mode = WAL");
  instance
    .prepare(`
      CREATE TABLE IF NOT EXISTS check_ins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        date TEXT NOT NULL,
        moodScore INTEGER NOT NULL,
        stressScore INTEGER NOT NULL,
        notes TEXT
      )
    `)
    .run();

  return instance;
}

export const db = globalForDb._sentinelaDb ?? createDatabaseInstance();

if (!globalForDb._sentinelaDb) {
  globalForDb._sentinelaDb = db;
}

export function insertCheckIn(entry: Omit<CheckInRecord, "id">) {
  const stmt = db.prepare<
    [string, string, number, number, string | null]
  >(
    `
    INSERT INTO check_ins (userId, date, moodScore, stressScore, notes)
    VALUES (?, ?, ?, ?, ?)
  `
  );

  const result = stmt.run(
    entry.userId,
    entry.date,
    entry.moodScore,
    entry.stressScore,
    entry.notes ?? null
  );

  return { ...entry, id: Number(result.lastInsertRowid) } satisfies CheckInRecord;
}

export function listCheckInsByUser(userId: string) {
  return db
    .prepare<[string]>(
      `
      SELECT id, userId, date, moodScore, stressScore, notes
      FROM check_ins
      WHERE userId = ?
      ORDER BY date DESC, id DESC
    `
    )
    .all(userId) as CheckInRecord[];
}

export function listCheckInsByUserSince(userId: string, isoDate: string) {
  return db
    .prepare<[string, string]>(
      `
      SELECT id, userId, date, moodScore, stressScore, notes
      FROM check_ins
      WHERE userId = ? AND date >= ?
      ORDER BY date DESC, id DESC
    `
    )
    .all(userId, isoDate) as CheckInRecord[];
}

export function findLatestCheckIn(userId: string) {
  return db
    .prepare<[string]>(
      `
      SELECT id, userId, date, moodScore, stressScore, notes
      FROM check_ins
      WHERE userId = ?
      ORDER BY date DESC, id DESC
      LIMIT 1
    `
    )
    .get(userId) as CheckInRecord | undefined;
}
