import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

const config = {
  client: "better-sqlite3",
  connection: {
    filename: path.join(currentDir, "knex.db"),
  },
  migrations: {
    directory: path.join(currentDir, "migrations"),
  },
  pool: {
    afterCreate(connection, done) {
      connection.pragma("foreign_keys = ON");
      done(null, connection);
    },
  },
  useNullAsDefault: true,
};

export default config;
