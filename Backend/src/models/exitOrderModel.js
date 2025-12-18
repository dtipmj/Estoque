import { pool } from "../config/db.js";

export async function createExitOrder({
  movement_id,
  client_name,
  client_document,
  declaration,
  pdf_path,
  items,
}) {
  const items_json = JSON.stringify(items || []);

  const [result] = await pool.query(
    `INSERT INTO exit_orders
       (movement_id, client_name, client_document, declaration, pdf_path, items_json)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [movement_id, client_name, client_document, declaration, pdf_path, items_json]
  );

  return { id: result.insertId };
}

export async function listExitOrdersWithDetails({ requester } = {}) {
  const { role, unit_id } = requester || {};

  let sql = `
    SELECT
      eo.id,
      eo.movement_id,
      eo.client_name,
      eo.client_document,
      eo.pdf_path,
      eo.signature_image,
      eo.created_at,
      eo.items_json,              -- <<-- NOVO
      m.description   AS movement_description,
      m.quantity      AS movement_quantity,
      p.name          AS product,
      w.name          AS warehouse,
      w.id            AS warehouse_id
    FROM exit_orders eo
    JOIN stock_movements m ON m.id = eo.movement_id
    JOIN products p        ON p.id = m.product_id
    JOIN warehouses w      ON w.id = m.warehouse_id
  `;
  const params = [];

  if (role !== "super_admin") {
    sql += " WHERE w.unit_id = ?";
    params.push(unit_id);
  }

  sql += " ORDER BY eo.created_at DESC";

  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function findExitOrderById(id) {
  const [rows] = await pool.query(
    `
    SELECT
      eo.*,
      m.quantity      AS movement_quantity,
      m.description   AS movement_description,
      m.created_at    AS movement_created_at,
      p.name          AS product,
      w.name          AS warehouse,
      w.id            AS warehouse_id
    FROM exit_orders eo
    JOIN stock_movements m ON m.id = eo.movement_id
    JOIN products p        ON p.id = m.product_id
    JOIN warehouses w      ON w.id = m.warehouse_id
    WHERE eo.id = ?
    `,
    [id]
  );
  return rows[0] || null;
}


export async function saveExitOrderSignature(id, { signature_image, pdf_path }) {
  const fields = [];
  const values = [];

  if (signature_image !== undefined) {
    fields.push("signature_image = ?");
    values.push(signature_image);
  }

  if (pdf_path !== undefined) {
    fields.push("pdf_path = ?");
    values.push(pdf_path);
  }

  if (!fields.length) return;

  values.push(id);

  await pool.query(
    `UPDATE exit_orders SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
}
