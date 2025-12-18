import {
  createProduct,
  listProducts,
  updateProduct,
  deleteProduct,
  findProductByBarcode,
} from "../models/productModel.js";

export async function createProductController(req, res, next) {
  try {
    const { name, unit, warehouse_id, barcode, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Nome do produto é obrigatório" });
    }
    if (!warehouse_id) {
      return res
        .status(400)
        .json({ error: "É obrigatório informar o estoque do produto" });
    }

    const product = await createProduct({
      name,
      unit,
      warehouse_id,
      barcode,
      description,
    });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

export async function listProductsController(req, res, next) {
  try {
    const { q } = req.query;
    const products = await listProducts({ requester: req.user, q });
    res.json(products);
  } catch (err) {
    next(err);
  }
}

export async function updateProductController(req, res, next) {
  try {
    const { id } = req.params;
    const { name, unit, barcode, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Nome do produto é obrigatório" });
    }

    await updateProduct(id, { name, unit, barcode, description });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
export async function deleteProductController(req, res, next) {
  try {
    const { id } = req.params;
    await deleteProduct(id);
    res.status(204).end();
  } catch (err) {
    if (err.code === "PRODUCT_IN_USE") {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

export async function getProductByBarcodeController(req, res, next) {
  try {
    const { barcode } = req.query; // /api/produtos/barcode?barcode=...

    if (!barcode) {
      return res.status(400).json({ error: "Código de barras é obrigatório" });
    }

    const product = await findProductByBarcode(barcode, { requester: req.user });

    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
}