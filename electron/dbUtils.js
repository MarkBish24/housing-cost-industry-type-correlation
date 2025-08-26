import { client } from "./db.js";

export async function getAllUsers(table) {
  const res = await client.query(`SELECT * FROM ${table}`);
  return res.rows;
}

export async function getViewData(view) {
  const res = await client.query(`SELECT * FROM ${view}`);
  return res.rows;
}

export async function getViewDataWithFilter(view, column, value) {
  const res = await client.query(`SELECT * FROM ${view} WHERE ${column} = $1`, [
    value,
  ]);
  return res.rows;
}
