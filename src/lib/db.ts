import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

export type UserStatus = "pending_verification" | "active";

export interface UserRecord {
  id: number;
  name: string;
  birthDate: string;
  email: string;
  passwordHash: string;
  status: UserStatus;
  verificationCode: string | null;
  verificationCodeSentAt: string | null;
  createdAt: string;
}

export interface CheckInRecord {
  id: number;
  userId: number;
  date: string;
  energyScore: number;
  focusScore: number;
  emotionalBalanceScore: number;
  sleepQualityScore: number;
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
    birthDate TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    passwordHash TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_verification',
    verificationCode TEXT,
    verificationCodeSentAt TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS check_ins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    energyScore INTEGER NOT NULL CHECK(energyScore BETWEEN 0 AND 10),
    focusScore INTEGER NOT NULL CHECK(focusScore BETWEEN 0 AND 10),
    emotionalBalanceScore INTEGER NOT NULL CHECK(emotionalBalanceScore BETWEEN 0 AND 10),
    sleepQualityScore INTEGER NOT NULL CHECK(sleepQualityScore BETWEEN 0 AND 10),
    notes TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_check_ins_user_date
    ON check_ins(userId, datetime(date));

  CREATE UNIQUE INDEX IF NOT EXISTS uniq_check_ins_user_day
    ON check_ins(userId, date(date));
`);

const userColumns = database.prepare("PRAGMA table_info(users)").all() as { name: string }[];
const userColumnNames = new Set(userColumns.map((column) => column.name));

if (!userColumnNames.has("status")) {
  database.exec("ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'active'");
}

if (!userColumnNames.has("verificationCode")) {
  database.exec("ALTER TABLE users ADD COLUMN verificationCode TEXT");
}

if (!userColumnNames.has("verificationCodeSentAt")) {
  database.exec("ALTER TABLE users ADD COLUMN verificationCodeSentAt TEXT");
}

const checkInColumns = database.prepare("PRAGMA table_info(check_ins)").all() as { name: string }[];
const checkInColumnNames = new Set(checkInColumns.map((column) => column.name));

if (!checkInColumnNames.has("energyScore")) {
  database.exec(`
    ALTER TABLE check_ins RENAME TO check_ins_legacy;

    CREATE TABLE check_ins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      energyScore INTEGER NOT NULL CHECK(energyScore BETWEEN 0 AND 10),
      focusScore INTEGER NOT NULL CHECK(focusScore BETWEEN 0 AND 10),
      emotionalBalanceScore INTEGER NOT NULL CHECK(emotionalBalanceScore BETWEEN 0 AND 10),
      sleepQualityScore INTEGER NOT NULL CHECK(sleepQualityScore BETWEEN 0 AND 10),
      notes TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    INSERT INTO check_ins (
      id,
      userId,
      date,
      energyScore,
      focusScore,
      emotionalBalanceScore,
      sleepQualityScore,
      notes,
      createdAt
    )
    SELECT
      id,
      userId,
      date,
      MIN(10, MAX(0, ROUND((COALESCE(moodScore, 3) - 1) * 2.5))),
      6,
      6,
      6,
      notes,
      createdAt
    FROM check_ins_legacy;

    DROP TABLE check_ins_legacy;

    CREATE INDEX IF NOT EXISTS idx_check_ins_user_date
      ON check_ins(userId, datetime(date));

    CREATE UNIQUE INDEX IF NOT EXISTS uniq_check_ins_user_day
      ON check_ins(userId, date(date));
  `);
}

export function getUserByEmail(email: string): UserRecord | undefined {
  const statement = database.prepare(
    `SELECT id, name, birthDate, email, passwordHash, status, verificationCode, verificationCodeSentAt, createdAt
       FROM users WHERE email = ?`
  );
  return statement.get(email) as UserRecord | undefined;
}

export function createUser(user: {
  name: string;
  birthDate: string;
  email: string;
  passwordHash: string;
  status: UserStatus;
  verificationCode: string | null;
  verificationCodeSentAt: string | null;
}): UserRecord {
  const insert = database.prepare(
    `INSERT INTO users (name, birthDate, email, passwordHash, status, verificationCode, verificationCodeSentAt, createdAt)
     VALUES (@name, @birthDate, @email, @passwordHash, @status, @verificationCode, @verificationCodeSentAt, datetime('now'))`
  );

  const info = insert.run(user);
  const select = database.prepare(
    `SELECT id, name, birthDate, email, passwordHash, status, verificationCode, verificationCodeSentAt, createdAt
       FROM users WHERE id = ?`
  );
  return select.get(Number(info.lastInsertRowid)) as UserRecord;
}

export function updatePendingUser(payload: {
  id: number;
  name: string;
  birthDate: string;
  passwordHash: string;
  verificationCode: string;
  verificationCodeSentAt: string;
}): UserRecord {
  const update = database.prepare(
    `UPDATE users
        SET name = @name,
            birthDate = @birthDate,
            passwordHash = @passwordHash,
            status = 'pending_verification',
            verificationCode = @verificationCode,
            verificationCodeSentAt = @verificationCodeSentAt
      WHERE id = @id`
  );

  update.run(payload);

  const select = database.prepare(
    `SELECT id, name, birthDate, email, passwordHash, status, verificationCode, verificationCodeSentAt, createdAt
       FROM users WHERE id = ?`
  );

  return select.get(payload.id) as UserRecord;
}

export function refreshVerificationCode(payload: {
  id: number;
  verificationCode: string;
  verificationCodeSentAt: string;
}): UserRecord {
  const update = database.prepare(
    `UPDATE users
        SET verificationCode = @verificationCode,
            verificationCodeSentAt = @verificationCodeSentAt
      WHERE id = @id`
  );

  update.run(payload);

  const select = database.prepare(
    `SELECT id, name, birthDate, email, passwordHash, status, verificationCode, verificationCodeSentAt, createdAt
       FROM users WHERE id = ?`
  );

  return select.get(payload.id) as UserRecord;
}

export function markUserAsVerified(userId: number): UserRecord {
  const update = database.prepare(
    `UPDATE users
        SET status = 'active',
            verificationCode = NULL,
            verificationCodeSentAt = NULL
      WHERE id = ?`
  );

  update.run(userId);

  const select = database.prepare(
    `SELECT id, name, birthDate, email, passwordHash, status, verificationCode, verificationCodeSentAt, createdAt
       FROM users WHERE id = ?`
  );

  return select.get(userId) as UserRecord;
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
  energyScore: number;
  focusScore: number;
  emotionalBalanceScore: number;
  sleepQualityScore: number;
  notes: string | null;
}): CheckInRecord {
  const insert = database.prepare(
    `INSERT INTO check_ins (userId, date, energyScore, focusScore, emotionalBalanceScore, sleepQualityScore, notes, createdAt)
     VALUES (@userId, @date, @energyScore, @focusScore, @emotionalBalanceScore, @sleepQualityScore, @notes, datetime('now'))`
  );

  const payload = {
    ...checkIn,
    userId: toNumberId(checkIn.userId),
  };

  const info = insert.run(payload);
  const select = database.prepare(
    `SELECT id, userId, date, energyScore, focusScore, emotionalBalanceScore, sleepQualityScore, notes, createdAt
       FROM check_ins WHERE id = ?`
  );
  return select.get(Number(info.lastInsertRowid)) as CheckInRecord;
}

export function listCheckInsByUser(userId: string | number): CheckInRecord[] {
  const statement = database.prepare(
    `SELECT id, userId, date, energyScore, focusScore, emotionalBalanceScore, sleepQualityScore, notes, createdAt
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
    `SELECT id, userId, date, energyScore, focusScore, emotionalBalanceScore, sleepQualityScore, notes, createdAt
       FROM check_ins
       WHERE userId = ? AND datetime(date) >= datetime(?)
       ORDER BY datetime(date) DESC`
  );

  return statement.all(toNumberId(userId), sinceISODate) as CheckInRecord[];
}

export function findLatestCheckIn(userId: string | number): CheckInRecord | undefined {
  const statement = database.prepare(
    `SELECT id, userId, date, energyScore, focusScore, emotionalBalanceScore, sleepQualityScore, notes, createdAt
       FROM check_ins
       WHERE userId = ?
       ORDER BY datetime(date) DESC
       LIMIT 1`
  );

  return statement.get(toNumberId(userId)) as CheckInRecord | undefined;
}

export function findCheckInByUserAndDateRange(
  userId: string | number,
  startISODate: string,
  endISODate: string
): CheckInRecord | undefined {
  const statement = database.prepare(
    `SELECT id, userId, date, energyScore, focusScore, emotionalBalanceScore, sleepQualityScore, notes, createdAt
       FROM check_ins
       WHERE userId = ?
         AND datetime(date) >= datetime(?)
         AND datetime(date) < datetime(?)
       ORDER BY datetime(date) DESC
       LIMIT 1`
  );

  return statement.get(toNumberId(userId), startISODate, endISODate) as
    | CheckInRecord
    | undefined;
}

export function updateCheckIn(checkIn: {
  id: number;
  energyScore: number;
  focusScore: number;
  emotionalBalanceScore: number;
  sleepQualityScore: number;
  notes: string | null;
}): CheckInRecord {
  const update = database.prepare(
    `UPDATE check_ins
        SET energyScore = @energyScore,
            focusScore = @focusScore,
            emotionalBalanceScore = @emotionalBalanceScore,
            sleepQualityScore = @sleepQualityScore,
            notes = @notes
      WHERE id = @id`
  );

  update.run(checkIn);

  const select = database.prepare(
    `SELECT id, userId, date, energyScore, focusScore, emotionalBalanceScore, sleepQualityScore, notes, createdAt
       FROM check_ins WHERE id = ?`
  );

  return select.get(checkIn.id) as CheckInRecord;
}

export default database;
