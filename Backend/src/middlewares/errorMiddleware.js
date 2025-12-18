export function errorHandler(err, req, res, next) {
  console.error("Erro não tratado:", err);
  res.status(err.statusCode || 500).json({
    error: err.message || "Erro interno do servidor",
  });
}
