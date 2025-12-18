import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import warehouseRoutes from "./routes/warehouseRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import userRoutes from "./routes/userRoutes.js"; 
import { errorHandler } from "./middlewares/errorMiddleware.js";
import exitOrderRoutes from "./routes/exitOrderRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import unitRoutes from "./routes/unitRoutes.js";

import path from "path";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ message: "API de Estoque OK" });
});

app.use("/api/auth", authRoutes);
app.use("/api/produtos", productRoutes);
app.use("/api/estoques", warehouseRoutes);
app.use("/api/estoque", stockRoutes);
app.use("/api/relatorios", reportRoutes);
app.use("/api/users", userRoutes);
app.use("/files", express.static(path.join(process.cwd(), "storage")));
app.use("/api/assinaturas", exitOrderRoutes);
app.use("/api/os-saida", exitOrderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/unidades", unitRoutes);

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(errorHandler);

export default app;
