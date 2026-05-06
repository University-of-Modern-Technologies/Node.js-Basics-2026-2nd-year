import "dotenv/config";
import knex from "knex";
import config from "./knexfile.js";

// Ізольоване Knex-підключення.
// Ці приклади працюють з examples-knex/knex.db, а не з Prisma dev.db.
const db = knex(config);

export default db;
