import { createApp } from "./app";
import { config } from "./config";
import { createDb } from "./db";

const db = createDb(config.databaseFile);
const app = createApp(db);

const server = app.listen(config.port, () => {
  console.log(`Server listening on http://localhost:${config.port}`);
});

const shutdown = () => {
  server.close(() => {
    db.close();
    process.exit(0);
  });
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
