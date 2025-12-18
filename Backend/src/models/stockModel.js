import { pool } from "../config/db.js";

export async function getCurrentStock(product_id, warehouse_id, conn = pool) {
  const [rows] = await conn.query(
    "SELECT id, quantity FROM stock WHERE product_id = ? AND warehouse_id = ?",
    [product_id, warehouse_id]
  );
  return rows[0] || null;
}

export async function upsertStock({
  product_id,
  warehouse_id,
  quantity,
  conn = pool,
}) {
  const current = await getCurrentStock(product_id, warehouse_id, conn);

  if (!current) {
    const [result] = await conn.query(
      "INSERT INTO stock (product_id, warehouse_id, quantity) VALUES (?, ?, ?)",
      [product_id, warehouse_id, quantity]
    );
    return { id: result.insertId, previous_qty: 0, new_qty: quantity };
  } else {
    const previous_qty = Number(current.quantity);
    const new_qty = previous_qty + Number(quantity);
    await conn.query("UPDATE stock SET quantity = ? WHERE id = ?", [
      new_qty,
      current.id,
    ]);
    return { id: current.id, previous_qty, new_qty };
  }
}

export async function decreaseStock({
  product_id,
  warehouse_id,
  quantity,
  conn = pool,
}) {
  const current = await getCurrentStock(product_id, warehouse_id, conn);

  if (!current) {
    throw new Error("Não há estoque para esse produto nesse local");
  }

  const previous_qty = Number(current.quantity);
  const qty = Number(quantity);

  if (qty > previous_qty) {
    const err = new Error("Quantidade maior que o estoque disponível");
    err.statusCode = 400;
    throw err;
  }

  const new_qty = previous_qty - qty;

  await conn.query("UPDATE stock SET quantity = ? WHERE id = ?", [
    new_qty,
    current.id,
  ]);

  return { id: current.id, previous_qty, new_qty };
}
