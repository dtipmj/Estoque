import bcrypt from "bcryptjs";
import { createUser, listUsers, updateUser, deleteUser, findUserByEmail, findUserWithRelations } from "../models/userModel.js";

export async function listUsersController(req, res, next) {
  try {
    const users = await listUsers({ requester: req.user });
    res.json(users);
  } catch (err) {
    next(err);
  }
}

export async function createUserController(req, res, next) {
  try {
    const { name, email, role, password, unit_id, warehouse_id, matricula } = req.body;

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "E-mail já cadastrado" });
    }

    // ✅ senha opcional
    let password_hash = null;
    if (typeof password === "string" && password.trim().length > 0) {
      password_hash = await hashPassword(password.trim());
    }

    const user = await createUser({
      name,
      email,
      password_hash, // null se não veio senha
      role: role || "user",
      unit_id: unit_id || null,
      warehouse_id: warehouse_id || null,
      matricula: matricula || null,
    });

    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

export async function loginController(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email); 
    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, unit_id: user.unit_id },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    const { password_hash, ...publicUser } = user;

    res.json({
      token,
      user: publicUser, 
    });
  } catch (err) {
    next(err);
  }
}


export async function updateUserController(req, res, next) {
  try {
    const { id } = req.params;
    const { name, email, role, unit_id, warehouse_id, password, matricula } = req.body;

    let finalUnitId = unit_id;
    if (req.user.role === "admin") {
      finalUnitId = req.user.unit_id;
    }

    if (req.user.role !== "super_admin" && role === "super_admin") {
      return res.status(403).json({ error: "Você não pode promover para super admin" });
    }

    let password_hash;
    if (password) {
      password_hash = await bcrypt.hash(password, 10);
    }

    await updateUser(id, {
      name,
      email,
      role,
      unit_id: finalUnitId,
      warehouse_id,
      password_hash,
      matricula,
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
export async function deleteUserController(req, res, next) {
  try {
    const { id } = req.params;

    await deleteUser(id);

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function updateOwnProfileController(req, res, next) {
  try {
    const userId = req.user.id;
    const { name, email, password } = req.body;

    let password_hash;
    if (password) {
      password_hash = await bcrypt.hash(password, 10);
    }

    await updateUser(userId, {
      name,
      email,
      password_hash,
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function uploadAvatarController(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    const avatar_url = `/uploads/avatars/${req.file.filename}`;

    await updateUser(req.user.id, { avatar_url });

    res.json({ avatar_url });
  } catch (err) {
    next(err);
  }
}

export async function getOwnProfileController(req, res, next) {
  try {
    const userId = req.user.id;

    const user = await findUserWithRelations(userId);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const { password_hash, ...publicUser } = user;

    res.json(publicUser); // => inclui avatar_url
  } catch (err) {
    next(err);
  }
}