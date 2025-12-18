import { pool } from "../config/db.js";

export async function createUnit({ name, acronym, description }) {
  const [result] = await pool.query(
    `INSERT INTO units (name, acronym, description)
     VALUES (?, ?, ?)`,
    [name, acronym, description || null]
  );

  return {
    id: result.insertId,
    name,
    acronym,
    description: description || null,
  };
}

// super_admin vê todas; admin vê só a unidade dele
export async function listUnits({ requester }) {
  if (!requester) {
    return [];
  }

  if (requester.role === "super_admin") {
    const [rows] = await pool.query(
      `SELECT id, name, acronym, description, created_at
       FROM units
       ORDER BY name ASC`
    );
    return rows;
  }

  // admin / supervisor / user: só a unidade onde ele está
  if (requester.unit_id) {
    const [rows] = await pool.query(
      "SELECT id, name, acronym, description, created_at FROM units WHERE id = ?",
      [requester.unit_id]
    );
    return rows;
  }

  return [];
}

export async function updateUnit(id, { name, description }) {
  await pool.query(
    "UPDATE units SET name = ?, acronym = ?, description = ? WHERE id = ?",
    [name, description || null, id]
  );
}

export async function deleteUnit(id) {
  // não deixa excluir se tiver estoques vinculados
  const [whRows] = await pool.query(
    "SELECT COUNT(*) AS total FROM warehouses WHERE unit_id = ?",
    [id]
  );
  if (whRows[0].total > 0) {
    throw new Error(
      "Esta unidade não pode ser excluída pois possui estoques vinculados."
    );
  }

  // não deixa excluir se tiver usuários vinculados
  const [userRows] = await pool.query(
    "SELECT COUNT(*) AS total FROM users WHERE unit_id = ?",
    [id]
  );
  if (userRows[0].total > 0) {
    throw new Error(
      "Esta unidade não pode ser excluída pois possui usuários vinculados."
    );
  }

  await pool.query("DELETE FROM units WHERE id = ?", [id]);
}
