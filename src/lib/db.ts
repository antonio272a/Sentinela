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

export default database;
