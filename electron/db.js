import pkg from "pg";
import { Client } from "pg";
import dotenv from "dotenv";
dotenv.config();

// DB_USER
// DB_HOST
// DB_DATABASE
// DB_PASSWORD

const DB_USER = process.env.DB_USER;
const DB_HOST = process.env.DB_HOST;
const DB_DATABASE = process.env.DB_DATABASE;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_PORT = process.env.DB_PORT;

const client = new Client({
  user: DB_USER,
  host: DB_HOST,
  database: DB_DATABASE,
  password: DB_PASSWORD,
  port: DB_PORT,
});

export async function connectDB() {
  try {
    await client.connect();
    console.log(`✅ Connected to Postgres SERVER PORT : ${DB_PORT}`);
  } catch (err) {
    console.error("❌ Connection error:", err);
  }
}
