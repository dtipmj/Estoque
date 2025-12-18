import { pool } from "../config/db.js";

export async function registerMovement({
  product_id,
  warehouse_id,
  user_id,
  type,
  quantity,
  previous_qty,
  new_qty,
  description,
  conn = pool,
}) {
  const [result] = await conn.query(
    `INSERT INTO stock_movements
    (product_id, warehouse_id, user_id, type, quantity, previous_qty, new_qty, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      product_id,
      warehouse_id,
      user_id || null,
      type,
      quantity,
      previous_qty,
      new_qty,
      description,
    ]
  );

  return { id: result.insertId };
}

export async function listStockReport(options) {
  const { requester, warehouseId = null } = options || {};

  const role = requester?.role;
  const unitId = requester?.unit_id;

  let sql = `
    SELECT
      w.id   AS warehouse_id,
      w.name AS warehouse,
      p.id   AS product_id,
      p.name AS product,
      p.unit AS product_unit,  -- unidade do produto (UN/CX/KG)
      s.quantity AS current_quantity,
      COALESCE(SUM(
        CASE WHEN m.type = 'ENTRADA' THEN m.quantity ELSE 0 END
      ), 0) AS total_entries
    FROM stock s
    JOIN products  p ON p.id = s.product_id
    JOIN warehouses w ON w.id = s.warehouse_id
    LEFT JOIN stock_movements m
      ON m.product_id = s.product_id
     AND m.warehouse_id = s.warehouse_id
  `;

  const params = [];
  const where = [];

  if (warehouseId) {
    where.push("s.warehouse_id = ?");
    params.push(warehouseId);
  }

  if (requester && role !== "super_admin") {
    where.push("w.unit_id = ?");
    params.push(unitId);
  }

  if (where.length) {
    sql += " WHERE " + where.join(" AND ");
  }

  sql += `
    GROUP BY
      w.id, w.name,
      p.id, p.name, p.unit,
      s.quantity
    ORDER BY w.name, p.name
  `;

  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function listMovementReport(options) {
  const { requester, warehouseId = null } = options || {};

  const role = requester?.role;
  const unitId = requester?.unit_id;
  const userWarehouseId = requester?.warehouse_id;

  let sql = `
    SELECT
      m.id,
      m.created_at,
      m.type,
      m.quantity,
      m.previous_qty,
      m.new_qty,
      m.description,
      p.name AS product,
      p.unit AS product_unit,
      w.name AS warehouse,
      m.user_id,
      u.name AS user_name          -- <<< quem fez a movimentação
    FROM stock_movements m
    JOIN products  p ON p.id = m.product_id
    JOIN warehouses w ON w.id = m.warehouse_id
    LEFT JOIN users u ON u.id = m.user_id   -- <<< join com users
  `;

  const params = [];
  const where = [];

  if (warehouseId) {
    where.push("m.warehouse_id = ?");
    params.push(warehouseId);
  } else if (requester) {
    if (role === "super_admin") {
      // vê tudo
    } else if (role === "admin" || role === "supervisor") {
      where.push("w.unit_id = ?");
      params.push(unitId);
    } else {
      where.push("m.user_id = ?");
      params.push(requester?.id);
    }
  }

  if (where.length) {
    sql += " WHERE " + where.join(" AND ");
  }

  sql += " ORDER BY m.created_at DESC";

  const [rows] = await pool.query(sql, params);
  return rows;
}

