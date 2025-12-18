import {
  createWarehouse,
  listWarehouses,
  updateWarehouse,
  deleteWarehouse,
} from "../models/warehouseModel.js";

export async function createWarehouseController(req, res, next) {
  try {
    const { name, description, unit_id } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Nome do estoque é obrigatório" });
    }

    let finalUnitId = unit_id;
    if (req.user.role !== "super_admin") {
      finalUnitId = req.user.unit_id; 
    }

    const warehouse = await createWarehouse({
      name,
      description,
      unit_id: finalUnitId,
    });

    res.status(201).json(warehouse);
  } catch (err) {
    next(err);
  }
}

export async function listWarehousesController(req, res, next) {
  try {
    const warehouses = await listWarehouses({ requester: req.user });
    res.json(warehouses);
  } catch (err) {
    next(err);
  }
}

export async function updateWarehouseController(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, unit_id } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Nome do estoque é obrigatório" });
    }

    let finalUnitId;

    if (req.user.role === "super_admin") {
      finalUnitId = unit_id ?? null;
    } else {
      finalUnitId = undefined;
    }

    await updateWarehouse(id, {
      name,
      description,
      unit_id: finalUnitId,
    });

    res.json({ message: "Estoque atualizado com sucesso" });
  } catch (err) {
    next(err);
  }
}

export async function deleteWarehouseController(req, res, next) {
  try {
    const { id } = req.params;
    await deleteWarehouse(id);
    res.json({ message: "Estoque excluído com sucesso" });
  } catch (err) {
    next(err);
  }
}
