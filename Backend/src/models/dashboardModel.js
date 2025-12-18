import { pool } from "../config/db.js";

export async function getDashboardSummary({ warehouseId = null } = {}) {
  const stockWhere = warehouseId ? "WHERE s.warehouse_id = ?" : "";
  const stockParams = warehouseId ? [warehouseId] : [];

  const [[stockRow]] = await pool.query(
    `
    SELECT
      COUNT(DISTINCT s.product_id)       AS products_with_stock,
      IFNULL(SUM(s.quantity), 0)         AS total_stock_quantity
    FROM stock s
    ${stockWhere}
    `,
    stockParams
  );

  const [[productsRow]] = await pool.query(
    "SELECT COUNT(*) AS total_products FROM products"
  );

  const [[warehousesRow]] = await pool.query(
    "SELECT COUNT(*) AS total_warehouses FROM warehouses"
  );

  const movWhereBase = warehouseId
    ? "WHERE m.warehouse_id = ?"
    : "WHERE 1=1";
  const movParamsBase = warehouseId ? [warehouseId] : [];

  const [[movMonthRow]] = await pool.query(
    `
    SELECT
      COUNT(*) AS total_movements,
      SUM(CASE WHEN m.type = 'ENTRADA' THEN 1 ELSE 0 END) AS entries,
      SUM(CASE WHEN m.type = 'SAIDA'   THEN 1 ELSE 0 END) AS exits
    FROM stock_movements m
    ${movWhereBase}
      AND YEAR(m.created_at)  = YEAR(CURDATE())
      AND MONTH(m.created_at) = MONTH(CURDATE())
    `,
    movParamsBase
  );

  const [movByMonthRows] = await pool.query(
    `
    SELECT
      DATE_FORMAT(m.created_at, '%Y-%m') AS month,
      COUNT(*) AS total,
      SUM(CASE WHEN m.type = 'ENTRADA' THEN 1 ELSE 0 END) AS entries,
      SUM(CASE WHEN m.type = 'SAIDA'   THEN 1 ELSE 0 END) AS exits
    FROM stock_movements m
    ${movWhereBase}
    GROUP BY month
    ORDER BY month DESC
    LIMIT 6
    `,
    movParamsBase
  );

  const [movByWarehouseRows] = await pool.query(
    `
    SELECT
      w.id,
      w.name,
      COUNT(*) AS total
    FROM stock_movements m
    JOIN warehouses w ON w.id = m.warehouse_id
    ${movWhereBase}
    GROUP BY w.id, w.name
    ORDER BY total DESC
    `,
    movParamsBase
  );

  return {
    cards: {
      total_stock_quantity: Number(stockRow.total_stock_quantity || 0),
      products_with_stock: Number(stockRow.products_with_stock || 0),
      total_products: Number(productsRow.total_products || 0),
      total_warehouses: warehouseId ? 1 : Number(warehousesRow.total_warehouses || 0),
      total_movements_month: Number(movMonthRow.total_movements || 0),
      entries_month: Number(movMonthRow.entries || 0),
      exits_month: Number(movMonthRow.exits || 0),
    },
    charts: {
      movements_by_month: movByMonthRows.slice().reverse(), 
      movements_by_warehouse: movByWarehouseRows,
    },
  };
}
