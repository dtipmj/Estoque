import {
  createUser,
  findUserByEmail,
  countUsers,
  setInviteTokenByEmail,
  findUserInviteByEmail,
  setPasswordAndClearInvite,
} from "../models/userModel.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import crypto from "crypto";


function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}


export async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    const totalUsers = await countUsers();
    if (totalUsers > 0 && (!req.user || req.user.role !== "admin")) {
      return res
        .status(403)
        .json({ error: "Apenas admin pode criar novos usuários" });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "E-mail já cadastrado" });
    }

    const password_hash = password ? await hashPassword(password) : null;
    const userRole = totalUsers === 0 ? "admin" : role || "comum";

    const user = await createUser({
      name,
      email,
      password_hash,
      role: userRole,
    });

    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);

    // 1) primeiro valida se o usuário existe
    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    // 2) depois valida se tem senha (conta ativada)
    if (!user.password_hash) {
      return res
        .status(403)
        .json({ error: "Conta não ativada. Verifique seu e-mail." });
    }

    // 3) valida a senha
    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const token = signToken({
      id: user.id,
      name: user.name,
      role: user.role,
      unit_id: user.unit_id,
      warehouse_id: user.warehouse_id,
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        warehouse_id: user.warehouse_id,
      },
    });
  } catch (err) {
    next(err);
  }
}


export async function inviteUser(req, res, next) {
  try {
    const { email } = req.body;

    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    if (user.password_hash) {
      return res.status(400).json({ error: "Usuário já possui senha definida" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = sha256(token);

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await setInviteTokenByEmail(email, tokenHash, expiresAt);

    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const link = `${baseUrl}/ativar?token=${token}&email=${encodeURIComponent(email)}`;

    return res.json({ message: "Convite gerado", link });
  } catch (err) {
    next(err);
  }
}

export async function setPassword(req, res, next) {
  try {
    const { email, token, password } = req.body;

    const user = await findUserInviteByEmail(email);
    if (!user) return res.status(400).json({ error: "Convite inválido" });

    if (!user.invite_token_hash || !user.invite_expires_at) {
      return res.status(400).json({ error: "Convite inválido" });
    }

    const tokenHash = sha256(token);

    if (tokenHash !== user.invite_token_hash) {
      return res.status(400).json({ error: "Token inválido" });
    }

    if (new Date(user.invite_expires_at) < new Date()) {
      return res.status(400).json({ error: "Token expirado" });
    }

    const password_hash = await hashPassword(password);
    await setPasswordAndClearInvite(user.id, password_hash);

    res.json({ message: "Senha criada com sucesso" });
  } catch (err) {
    next(err);
  }
}
