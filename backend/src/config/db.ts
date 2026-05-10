import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const db = new Pool({
  host: process.env.GLOBAL_DB_HOST,
  port: Number(process.env.GLOBAL_DB_PORT),
  database: process.env.GLOBAL_DB_NAME,
  user: process.env.GLOBAL_DB_USER,
  password: process.env.GLOBAL_DB_PASSWORD,
});

db.connect()
  .then(() => {
    console.log("PostgreSQL Connected");
  })
  .catch((err) => {
    console.error("Database Error:", err);
  });