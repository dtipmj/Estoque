import { pool } from "../config/db.js";

export async function createWarehouse({ name, description, unit_id }) {
  const [result] = await pool.query(
    "INSERT INTO warehouses (name, description, unit_id) VALUES (?, ?, ?)",
    [name, description, unit_id || null]
  );
  return { id: result.insertId, name, description, unit_id };
}

export async function listWarehouses({ requester } = {}) {
  const role = requester?.role;
  const userUnitId = requester?.unit_id;

  let sql = `
    SELECT
      w.id,
      w.name,
      w.description,
      w.unit_id,
      u.name   AS unit_name,
      u.acronym AS unit_acronym
    FROM warehouses w
    LEFT JOIN units u ON u.id = w.unit_id
  `;

  const params = [];

  if (role && role !== "super_admin") {
    sql += " WHERE w.unit_id = ?";
    params.push(userUnitId);
  }

  sql += " ORDER BY w.name ASC";

  const [rows] = await pool.query(sql, params);
  return rows;
}

// ⭐ agora o update é dinâmico e pode mudar a unidade também
export async function updateWarehouse(id, { name, description, unit_id }) {
  const fields = [];
  const values = [];

  if (name !== undefined) {
    fields.push("name = ?");
    values.push(name);
  }
  if (description !== undefined) {
    fields.push("description = ?");
    values.push(description);
  }
  if (unit_id !== undefined) {
    fields.push("unit_id = ?");
    values.push(unit_id || null);
  }

  if (!fields.length) return;

  values.push(id);

  await pool.query(
    `UPDATE warehouses SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
}

export async function deleteWarehouse(id) {
  const [movements] = await pool.query(
    "SELECT COUNT(*) AS total FROM stock_movements WHERE warehouse_id = ?",
    [id]
  );

  if (movements[0].total > 0) {
    throw new Error(
      "Este estoque não pode ser excluído pois possui movimentações registradas."
    );
  }

  const [stock] = await pool.query(
    "SELECT COUNT(*) AS total FROM stock WHERE warehouse_id = ?",
    [id]
  );

  if (stock[0].total > 0) {
    throw new Error(
      "Este estoque não pode ser excluído pois possui produtos em estoque."
    );
  }

  await pool.query("DELETE FROM warehouses WHERE id = ?", [id]);
}
