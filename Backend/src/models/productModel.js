import { pool } from "../config/db.js";

export async function createProduct({ name, unit, warehouse_id, barcode, description }) {
  // 1) cria o produto no catálogo
  const [result] = await pool.query(
    "INSERT INTO products (name, unit, barcode, description) VALUES (?, ?, ?, ?)",
    [name, unit, barcode || null, description || null]
  );

  const id = result.insertId;

  const skuNumber = String(id).padStart(5, "0"); 
  const sku = `P-${skuNumber}`;

  await pool.query(
    "UPDATE products SET sku = ? WHERE id = ?",
    [sku, id]
  );

  // 2) cria o registro de estoque (saldo inicial 0) no warehouse escolhido
  if (warehouse_id) {
    await pool.query(
      "INSERT INTO stock (product_id, warehouse_id, quantity) VALUES (?, ?, 0)",
      [id, warehouse_id]
    );
  }

  return { id, name, sku, unit, warehouse_id, barcode, description };
}

export async function listProducts({ requester, q } = {}) {
  const role = requester?.role;
  const unitId = requester?.unit_id;

  const term = (q || "").trim();

  if (role === "super_admin") {
    if (!term) {
      const [rows] = await pool.query(
        "SELECT id, name, sku, unit, barcode, description FROM products ORDER BY id DESC"
      );
      return rows;
    }

    const like = `%${term}%`;
    const [rows] = await pool.query(
      `
      SELECT id, name, sku, unit, barcode, description
      FROM products
      WHERE name LIKE ? OR sku LIKE ? OR barcode LIKE ?
      ORDER BY name ASC
      LIMIT 20
      `,
      [like, like, like]
    );
    return rows;
  }

  if (!term) {
    const sql = `
      SELECT DISTINCT p.id, p.name, p.sku, p.unit, p.barcode, p.description
      FROM products p
      JOIN stock s      ON s.product_id = p.id
      JOIN warehouses w ON w.id = s.warehouse_id
      WHERE w.unit_id = ?
      ORDER BY p.id DESC
    `;
    const [rows] = await pool.query(sql, [unitId]);
    return rows;
  }

  const like = `%${term}%`;
  const [rows] = await pool.query(
    `
    SELECT DISTINCT p.id, p.name, p.sku, p.unit, p.barcode, p.description
    FROM products p
    JOIN stock s      ON s.product_id = p.id
    JOIN warehouses w ON w.id = s.warehouse_id
    WHERE w.unit_id = ?
      AND (p.name LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ?)
    ORDER BY p.name ASC
    LIMIT 20
    `,
    [unitId, like, like, like]
  );

  return rows;
}


export async function updateProduct(id, { name, unit, barcode, description }) {
  await pool.query(
    "UPDATE products SET name = ?, unit = ?, barcode = ?, description = ? WHERE id = ?",
    [name, unit, barcode || null, description || null, id]
  );
}

export async function deleteProduct(id) {
  // verifica se tem registros em stock
  const [stockRows] = await pool.query(
    "SELECT COUNT(*) AS total FROM stock WHERE product_id = ?",
    [id]
  );
  const hasStock = stockRows[0].total > 0;

  // verifica se tem registros em stock_movements
  const [movRows] = await pool.query(
    "SELECT COUNT(*) AS total FROM stock_movements WHERE product_id = ?",
    [id]
  );
  const hasMovements = movRows[0].total > 0;

  if (hasStock || hasMovements) {
    const error = new Error(
      "Não é possível excluir este produto porque existe estoque ou movimentações vinculadas a ele."
    );
    error.code = "PRODUCT_IN_USE";
    throw error;
  }

  // se não tiver vínculo, pode excluir
  await pool.query("DELETE FROM products WHERE id = ?", [id]);
}

export async function findProductByBarcode(barcode, { requester } = {}) {
  const role = requester?.role;
  const unitId = requester?.unit_id;

  // super_admin enxerga tudo
  if (role === "super_admin") {
    const [rows] = await pool.query(
      `
      SELECT p.id, p.name, p.sku, p.unit, p.barcode, p.description
      FROM products p
      WHERE p.barcode = ?
      LIMIT 1
      `,
      [barcode]
    );
    return rows[0] || null;
  }

  // demais: só produtos da unidade dele
  const [rows] = await pool.query(
    `
    SELECT DISTINCT p.id, p.name, p.sku, p.unit, p.barcode, p.description
    FROM products p
    JOIN stock s      ON s.product_id = p.id
    JOIN warehouses w ON w.id = s.warehouse_id
    WHERE p.barcode = ?
      AND w.unit_id = ?
    LIMIT 1
    `,
    [barcode, unitId]
  );

  return rows[0] || null;
}