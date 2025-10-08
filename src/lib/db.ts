import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

export interface UserRecord {
  id: number;
  name: string;
  age: number;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface CheckInRecord {
  id: number;
  userId: number;
  date: string;
  moodScore: number;
  stressScore: number;
  notes: string | null;
  createdAt: string;
}

const dataDirectory = path.join(process.cwd(), "data");
const databasePath = path.join(dataDirectory, "sentinela.db");

if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory, { recursive: true });
}

const database = new Database(databasePath);
database.pragma("journal_mode = WAL");

database.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK(age >= 0),
    email TEXT NOT NULL UNIQUE,
    passwordHash TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS check_ins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    moodScore INTEGER NOT NULL CHECK(moodScore BETWEEN 1 AND 5),
    stressScore INTEGER NOT NULL CHECK(stressScore BETWEEN 1 AND 10),
    notes TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_check_ins_user_date
    ON check_ins(userId, datetime(date));
`);

export function getUserByEmail(email: string): UserRecord | undefined {
  const statement = database.prepare(
    "SELECT id, name, age, email, passwordHash, createdAt FROM users WHERE email = ?"
  );
  return statement.get(email) as UserRecord | undefined;
}

export function createUser(user: {
  name: string;
  age: number;
  email: string;
  passwordHash: string;
}): UserRecord {
  const insert = database.prepare(
    `INSERT INTO users (name, age, email, passwordHash, createdAt)
     VALUES (@name, @age, @email, @passwordHash, datetime('now'))`
  );

  const info = insert.run(user);
  const select = database.prepare(
    "SELECT id, name, age, email, passwordHash, createdAt FROM users WHERE id = ?"
  );
  return select.get(Number(info.lastInsertRowid)) as UserRecord;
}

function toNumberId(userId: string | number): number {
  const parsed = typeof userId === "number" ? userId : Number.parseInt(userId, 10);
  if (Number.isNaN(parsed)) {
    throw new Error("Invalid user id for check-in operation");
  }
  return parsed;
}

export function insertCheckIn(checkIn: {
  userId: string | number;
  date: string;
  moodScore: number;
  stressScore: number;
  notes: string | null;
}): CheckInRecord {
  const insert = database.prepare(
    `INSERT INTO check_ins (userId, date, moodScore, stressScore, notes, createdAt)
     VALUES (@userId, @date, @moodScore, @stressScore, @notes, datetime('now'))`
  );

  const payload = {
    ...checkIn,
    userId: toNumberId(checkIn.userId),
  };

  const info = insert.run(payload);
  const select = database.prepare(
    `SELECT id, userId, date, moodScore, stressScore, notes, createdAt
       FROM check_ins WHERE id = ?`
  );
  return select.get(Number(info.lastInsertRowid)) as CheckInRecord;
}

export function listCheckInsByUser(userId: string | number): CheckInRecord[] {
  const statement = database.prepare(
    `SELECT id, userId, date, moodScore, stressScore, notes, createdAt
       FROM check_ins
       WHERE userId = ?
       ORDER BY datetime(date) DESC`
  );

  return statement.all(toNumberId(userId)) as CheckInRecord[];
}

export function listCheckInsByUserSince(
  userId: string | number,
  sinceISODate: string
): CheckInRecord[] {
  const statement = database.prepare(
    `SELECT id, userId, date, moodScore, stressScore, notes, createdAt
       FROM check_ins
       WHERE userId = ? AND datetime(date) >= datetime(?)
       ORDER BY datetime(date) DESC`
  );

  return statement.all(toNumberId(userId), sinceISODate) as CheckInRecord[];
}

export function findLatestCheckIn(userId: string | number): CheckInRecord | undefined {
  const statement = database.prepare(
    `SELECT id, userId, date, moodScore, stressScore, notes, createdAt
       FROM check_ins
       WHERE userId = ?
       ORDER BY datetime(date) DESC
       LIMIT 1`
  );

  return statement.get(toNumberId(userId)) as CheckInRecord | undefined;
}

export default database;
