import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

export type Db = Database.Database;

export function createDb(file: string): Db {
  if (file !== ":memory:") {
    fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  }
  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      description TEXT    NOT NULL DEFAULT '',
      price       REAL    NOT NULL CHECK (price >= 0),
      category    TEXT    NOT NULL,
      status      TEXT    NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived')),
      created_at  TEXT    NOT NULL,
      updated_at  TEXT    NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
    CREATE INDEX IF NOT EXISTS idx_products_status   ON products (status);
  `);
  return db;
}
