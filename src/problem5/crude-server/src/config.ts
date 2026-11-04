import "dotenv/config";

export const config = {
  port: Number(process.env.PORT ?? 3000),
  databaseFile: process.env.DATABASE_FILE ?? "./data/app.db",
};
