import {
  listExitOrdersWithDetails,
  findExitOrderById,
  saveExitOrderSignature,
} from "../models/exitOrderModel.js";
import { addSignatureToPdf } from "../services/osService.js";
import { ensureWarehouseWritePermission } from "./stockController.js"; 
import path from "path";

export async function listExitOrdersController(req, res, next) {
  try {
    const isAdmin = req.user?.role === "admin";
    const warehouseFilter = isAdmin ? null : req.user?.warehouse_id || null;

    const orders = await listExitOrdersWithDetails({ requester: req.user });

    const storageRoot = path.join(process.cwd(), "storage");

    const mapped = orders.map((o) => {
      let pdf_url = null;

      if (o.pdf_path) {
        // relativo à pasta storage: "os-saida/OS-SAIDA-26.pdf"
        let relative = path.relative(storageRoot, o.pdf_path);
        // normaliza as barras para URL
        relative = relative.replace(/\\/g, "/");
        pdf_url = "/files/" + relative; // /files/os-saida/OS-SAIDA-26.pdf
      }

      return {
        ...o,
        is_signed: !!o.signature_image,
        pdf_url,
      };
    });

    res.json(mapped);
  } catch (err) {
    next(err);
  }
}

export async function signExitOrderController(req, res, next) {
  try {
    const { id } = req.params;
    const { signatureDataUrl } = req.body;

    if (!signatureDataUrl) {
      return res.status(400).json({ error: "Assinatura é obrigatória" });
    }

    const order = await findExitOrderById(id);
    if (!order) {
      return res.status(404).json({ error: "OS não encontrada" });
    }

    ensureWarehouseWritePermission(req, order.warehouse_id);

    const { newFilePath } = await addSignatureToPdf({
      order,
      signatureDataUrl,
    });

    await saveExitOrderSignature(order.id, {
      signature_image: signatureDataUrl,
      pdf_path: newFilePath,
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
