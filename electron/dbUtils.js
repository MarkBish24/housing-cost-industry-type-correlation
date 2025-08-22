import { client } from "./db.js";

export async function getAllUsers(table) {
  const res = await client.query(`SELECT * FROM ${table}`);
  return res.rows;
}

export async function getViewData(view) {
  const res = await client.query(`SELECT * FROM ${view}`);
  return res.rows;
}
