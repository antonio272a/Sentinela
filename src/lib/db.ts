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
database.pragma("busy_timeout = 5000");

const seedLockPath = path.join(dataDirectory, ".seed.lock");
const seedLockRetryDelayMs = 50;
const seedLockTimeoutMs = 5000;

function sleep(milliseconds: number) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}

function withSeedLock<T>(action: () => T): T {
  const start = Date.now();
  let fileDescriptor: number | undefined;

  for (;;) {
    try {
      fileDescriptor = fs.openSync(seedLockPath, "wx");
      break;
    } catch (error) {
      if (!(error instanceof Error) || (error as NodeJS.ErrnoException).code !== "EEXIST") {
        throw error;
      }

      if (Date.now() - start > seedLockTimeoutMs) {
        throw new Error("Timed out waiting for database seed lock");
      }

      sleep(seedLockRetryDelayMs);
    }
  }

  try {
    return action();
  } finally {
    if (fileDescriptor !== undefined) {
      fs.closeSync(fileDescriptor);
    }

    try {
      fs.unlinkSync(seedLockPath);
    } catch (error) {
      if (!(error instanceof Error) || (error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }
  }
}

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

const TEST_USER_EMAIL = "teste@teste.com";
const TEST_USER_PASSWORD_HASH = "$2b$10$GGpg6F1XtEcT26XwbDj9suNYCcL3LsoUIw/04J0/hCQtfpuXZc4yq";

withSeedLock(ensureTestFixtures);

function ensureTestFixtures() {
  const normalizedBirthDate = "1990-01-01";

  const selectUser = database.prepare(
    `SELECT id FROM users WHERE email = ?`
  );

  const existingUser = selectUser.get(TEST_USER_EMAIL) as { id: number } | undefined;

  let userId: number;

  if (!existingUser) {
    const insertUser = database.prepare(
      `INSERT INTO users (name, birthDate, email, passwordHash, status, verificationCode, verificationCodeSentAt, createdAt)
       VALUES (?, ?, ?, ?, 'active', NULL, NULL, datetime('now'))`
    );

    const info = insertUser.run(
      "Usuário Teste",
      normalizedBirthDate,
      TEST_USER_EMAIL,
      TEST_USER_PASSWORD_HASH
    );

    userId = Number(info.lastInsertRowid);
  } else {
    userId = existingUser.id;

    const updateUser = database.prepare(
      `UPDATE users
          SET name = ?,
              birthDate = ?,
              passwordHash = ?,
              status = 'active',
              verificationCode = NULL,
              verificationCodeSentAt = NULL
        WHERE id = ?`
    );

    updateUser.run("Usuário Teste", normalizedBirthDate, TEST_USER_PASSWORD_HASH, userId);
  }

  const findCheckInForDay = database.prepare(
    `SELECT id FROM check_ins WHERE userId = ? AND date(date) = date(?) LIMIT 1`
  );

  const insertCheckInForDay = database.prepare(
    `INSERT INTO check_ins (userId, date, energyScore, focusScore, emotionalBalanceScore, sleepQualityScore, notes, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`
  );

  const updateCheckInForDay = database.prepare(
    `UPDATE check_ins
        SET date = ?,
            energyScore = ?,
            focusScore = ?,
            emotionalBalanceScore = ?,
            sleepQualityScore = ?,
            notes = ?
      WHERE id = ?`
  );

  const triggers = [
    "Sobrecarga de reuniões",
    "Demandas críticas de clientes",
    "Noite com sono fragmentado",
    "Feedbacks desafiadores",
    "Pressão por prazos curtos",
  ];

  const highlights = [
    "Reconhecimento do time",
    "Entrega concluída com qualidade",
    "Treino revigorante",
    "Alinhamento estratégico",
    "Tempo de foco profundo",
  ];

  const intentions = [
    "Priorizar pausas conscientes",
    "Delegar uma demanda complexa",
    "Documentar aprendizados chave",
    "Fazer check-in com o time",
    "Bloquear agenda para foco",
  ];

  const clampScore = (value: number) => Math.max(0, Math.min(10, Math.round(value)));

  const seedCheckIns = database.transaction(() => {
    const reference = new Date();
    reference.setUTCHours(0, 0, 0, 0);

    for (let index = 0; index < 30; index += 1) {
      const day = new Date(reference);
      day.setUTCDate(reference.getUTCDate() - index);

      const isoDate = day.toISOString();

      const energyScore = clampScore(7 + Math.sin(index / 3) * 3 - (index % 9 === 0 ? 2 : 0));
      const focusScore = clampScore(6 + Math.cos(index / 2.5) * 2 - (index % 7 === 3 ? 2 : 0));
      const emotionalBalanceScore = clampScore(7 + Math.sin((index + 2) / 2.2) * 2);
      const sleepQualityScore = clampScore(6 + Math.cos((index + 1) / 2.1) * 2 - (index % 6 === 2 ? 1 : 0));

      const notes = [
        `Gatilhos: ${triggers[index % triggers.length]}`,
        `Ponto alto: ${highlights[index % highlights.length]}`,
        `Intenção: ${intentions[index % intentions.length]}`,
      ].join(" | ");

      const existingEntry = findCheckInForDay.get(userId, isoDate) as { id: number } | undefined;

      if (existingEntry) {
        updateCheckInForDay.run(
          isoDate,
          energyScore,
          focusScore,
          emotionalBalanceScore,
          sleepQualityScore,
          notes,
          existingEntry.id
        );
      } else {
        insertCheckInForDay.run(
          userId,
          isoDate,
          energyScore,
          focusScore,
          emotionalBalanceScore,
          sleepQualityScore,
          notes
        );
      }
    }
  });

  seedCheckIns();
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
