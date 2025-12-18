import { pool } from "../config/db.js";
import { upsertStock, decreaseStock } from "../models/stockModel.js";
import { registerMovement } from "../models/movementModel.js";
import { generateExitOS } from "../services/osService.js";
import { createExitOrder } from "../models/exitOrderModel.js";
import { ROLE_RANK } from "../middlewares/authMiddleware.js";

export async function stockEntryController(req, res, next) {
  const conn = await pool.getConnection();
  try {
    const { product_id, warehouse_id, quantity, description } = req.body;

    await ensureWarehouseWritePermission(req, warehouse_id);

    await conn.beginTransaction();

    const { previous_qty, new_qty } = await upsertStock({
      product_id,
      warehouse_id,
      quantity,
      conn,
    });

    await registerMovement({
      product_id,
      warehouse_id,
      user_id: req.user?.id,
      type: "ENTRADA",
      quantity,
      previous_qty,
      new_qty,
      description,
      conn,
    });

    await conn.commit();
    res.json({ message: "Entrada registrada com sucesso" });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

export async function ensureWarehouseWritePermission(req, warehouse_id) {
  const { role, unit_id } = req.user;

  if (role === "super_admin") return;

  if (ROLE_RANK[role] < ROLE_RANK["supervisor"]) {
    const err = new Error("Você não tem permissão para alterar este estoque");
    err.statusCode = 403;
    throw err;
  }

  const [rows] = await pool.query(
    "SELECT unit_id FROM warehouses WHERE id = ?",
    [warehouse_id]
  );
  const wh = rows[0];
  if (!wh) {
    const err = new Error("Estoque não encontrado");
    err.statusCode = 404;
    throw err;
  }

  if (Number(wh.unit_id) !== Number(unit_id)) {
    const err = new Error("Você não tem permissão nesta unidade");
    err.statusCode = 403;
    throw err;
  }
}

export async function ensureWarehouseReadPermission(req, warehouse_id) {
  const { role, unit_id } = req.user;

  if (role === "super_admin") return;

  const [rows] = await pool.query(
    "SELECT unit_id FROM warehouses WHERE id = ?",
    [warehouse_id]
  );
  const wh = rows[0];
  if (!wh) {
    const err = new Error("Estoque não encontrado");
    err.statusCode = 404;
    throw err;
  }

  if (Number(wh.unit_id) !== Number(unit_id)) {
    const err = new Error("Você não tem permissão nesta unidade");
    err.statusCode = 403;
    throw err;
  }
}

export async function stockExitController(req, res, next) {
  const conn = await pool.getConnection();

  try {
    const {
      warehouse_id,
      items,
      description,
      client_name,
      client_document,
    } = req.body;

    if (!Array.isArray(items) || !items.length) {
      const err = new Error("Nenhum item informado para saída");
      err.statusCode = 400;
      throw err;
    }

    await ensureWarehouseWritePermission(req, warehouse_id);

    await conn.beginTransaction();

    const movementIds = [];
    const operator_name = req.user?.name || "";

    // 1) Para cada item: baixa estoque + registra movimento
    for (const item of items) {
      const { product_id, quantity } = item;

      const { previous_qty, new_qty } = await decreaseStock({
        product_id,
        warehouse_id,
        quantity,
        conn,
      });

      const movement = await registerMovement({
        product_id,
        warehouse_id,
        user_id: req.user?.id,
        type: "SAIDA",
        quantity,
        previous_qty,
        new_qty,
        description,
        conn,
      });

      movementIds.push(movement.id);
    }

    await conn.commit();

    // 2) Carrega TODOS os movimentos dessa saída (OS) com nome do produto e do estoque
    const [rows] = await pool.query(
      `
      SELECT m.id, m.quantity, m.created_at,
             p.name AS product,
             w.name AS warehouse
      FROM stock_movements m
      JOIN products p ON p.id = m.product_id
      JOIN warehouses w ON w.id = m.warehouse_id
      WHERE m.id IN (?)
      ORDER BY m.id
      `,
      [movementIds]
    );

    const movements = rows;
    const firstMovement = movements[0]; // referência da OS (id, data, etc.)

    const declaration =
      "Declaro que recebi os materiais acima descritos, assumindo total responsabilidade pelo uso e conservação, comprometendo-me a devolvê-los em perfeitas condições ou ressarcir eventuais danos/avarias.";

    // 3) Gera PDF com TODOS os itens
    const { filePath } = await generateExitOS({
      movements,
      client_name,
      client_document,
      declaration,
      operator_name,
    });

    // 4) Monta array simples para guardar em JSON na tabela exit_orders
    const itemsForJson = movements.map((m) => ({
      product: m.product,
      quantity: m.quantity,
      warehouse: m.warehouse,
    }));

    await createExitOrder({
      movement_id: firstMovement.id, // número base da OS
      client_name,
      client_document,
      declaration,
      pdf_path: filePath,
      items: itemsForJson,
      operator_name,
    });

    res.json({
      message: "Saída registrada e OS gerada com sucesso",
      movement_id: firstMovement.id,
    });
  } catch (err) {
    try {
      await conn.rollback();
    } catch (_) { }
    next(err);
  } finally {
    conn.release();
  }
}

export async function stockEntryBatchController(req, res, next) {
  const conn = await pool.getConnection();

  try {
    const { warehouse_id, items, description } = req.body;

    if (!Array.isArray(items) || !items.length) {
      const err = new Error("Nenhum item informado para entrada");
      err.statusCode = 400;
      throw err;
    }

    await ensureWarehouseWritePermission(req, warehouse_id);

    await conn.beginTransaction();

    for (const item of items) {
      const { product_id, quantity } = item;

      if (!product_id || !quantity) {
        const err = new Error("Item inválido na lista de entrada");
        err.statusCode = 400;
        throw err;
      }

      const { previous_qty, new_qty } = await upsertStock({
        product_id,
        warehouse_id,
        quantity,
        conn,
      });

      await registerMovement({
        product_id,
        warehouse_id,
        user_id: req.user?.id,
        type: "ENTRADA",
        quantity,
        previous_qty,
        new_qty,
        description: description || "Entrada via Caixa Rápido",
        conn,
      });
    }

    await conn.commit();

    res.json({
      message: "Entrada em lote registrada com sucesso",
    });
  } catch (err) {
    try {
      await conn.rollback();
    } catch (_) {}
    next(err);
  } finally {
    conn.release();
  }
}