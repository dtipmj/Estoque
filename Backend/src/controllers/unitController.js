import {
  createUnit,
  listUnits,
  updateUnit,
  deleteUnit,
} from "../models/unitModel.js";

export async function listUnitsController(req, res, next) {
  try {
    const units = await listUnits({ requester: req.user });
    res.json(units);
  } catch (err) {
    next(err);
  }
}

export async function createUnitController(req, res, next) {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Nome da unidade é obrigatório" });
    }

    const unit = await createUnit({ name, description });
    res.status(201).json(unit);
  } catch (err) {
    next(err);
  }
}

export async function updateUnitController(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Nome da unidade é obrigatório" });
    }

    await updateUnit(id, { name, description });
    res.json({ message: "Unidade atualizada com sucesso" });
  } catch (err) {
    next(err);
  }
}

export async function deleteUnitController(req, res, next) {
  try {
    const { id } = req.params;

    await deleteUnit(id);
    res.json({ message: "Unidade excluída com sucesso" });
  } catch (err) {
    next(err);
  }
}
