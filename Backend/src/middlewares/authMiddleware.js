import { verifyToken } from "../utils/jwt.js";

export const ROLE_RANK = {
  user: 1,
  supervisor: 2,
  admin: 3,
  super_admin: 4,
};

export function authRequired(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token); 
    // agora o token PRECISA ter: { id, name, role, unit_id }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}

// permite ex: requireRole("admin","super_admin")
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Permissão negada" });
    }
    next();
  };
}

// para casos “hierárquicos”: mínimo papel
export function requireMinRole(minRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }
    if (ROLE_RANK[req.user.role] < ROLE_RANK[minRole]) {
      return res.status(403).json({ error: "Permissão negada" });
    }
    next();
  };
}
