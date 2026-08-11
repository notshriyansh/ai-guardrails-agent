import Database from "better-sqlite3";
import path from "path";

const databasePath = path.resolve(
  process.cwd(),
  "agent.db",
);

export const db: Database.Database =
  new Database(databasePath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");