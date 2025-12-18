import { pool } from "../config/db.js";

export async function findUserByEmail(email) {
  const [rows] = await pool.query(
    `
    SELECT 
      u.id,
      u.name,
      u.email,
      u.password_hash,
      u.role,
      u.unit_id,
      u.warehouse_id,
      u.avatar_url
    FROM users u
    WHERE u.email = ?
    `,
    [email]
  );

  return rows[0] || null;
}

export async function findUserById(id) {
  const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
  return rows[0] || null;
}

export async function createUser({
  name,
  email,
  password_hash,
  role,
  unit_id,
  warehouse_id,
  matricula
}) {
  const [result] = await pool.query(
    "INSERT INTO users (name, email, password_hash, role, matricula, unit_id, warehouse_id) VALUES (?,?,?,?,?,?,?)",
    [name, email, password_hash, role, matricula, unit_id || null, warehouse_id || null]
  );
  return { id: result.insertId, name, email, role, matricula, unit_id, warehouse_id };
}

export async function countUsers() {
  const [rows] = await pool.query("SELECT COUNT(*) AS total FROM users");
  return rows[0].total;
}

export async function listUsers({ requester } = {}) {
  let sql = `
    SELECT 
      u.id,
      u.name,
      u.email,
      u.role,
      u.created_at,
      u.matricula,          
      u.unit_id,
      un.name AS unit_name,
      u.warehouse_id,
      w.name AS warehouse_name
    FROM users u
    LEFT JOIN units un      ON un.id = u.unit_id
    LEFT JOIN warehouses w  ON w.id = u.warehouse_id
  `;
  const params = [];

  if (requester.role !== "super_admin") {
    sql += " WHERE u.unit_id = ?";
    params.push(requester.unit_id);
  }

  sql += " ORDER BY u.created_at DESC";

  const [rows] = await pool.query(sql, params);
  return rows;
}


export async function updateUser(
  id,
  { name, email, role, unit_id, warehouse_id, password_hash, avatar_url, matricula }
) {
  const fields = [];
  const values = [];

  if (name !== undefined) {
    fields.push("name = ?");
    values.push(name);
  }
  if (email !== undefined) {
    fields.push("email = ?");
    values.push(email);
  }
  if (role !== undefined) {
    fields.push("role = ?");
    values.push(role);
  }
  if (unit_id !== undefined) {
    fields.push("unit_id = ?");
    values.push(unit_id || null);
  }
  if (warehouse_id !== undefined) {
    fields.push("warehouse_id = ?");
    values.push(warehouse_id || null);
  }
  if (password_hash) {
    fields.push("password_hash = ?");
    values.push(password_hash);
  }
  if (avatar_url !== undefined) {
    fields.push("avatar_url = ?");
    values.push(avatar_url || null);
  }
  if (matricula !== undefined) {
    fields.push("matricula = ?");
    values.push(matricula);
  }

  if (!fields.length) return;

  values.push(id);

  await pool.query(
    `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
}

export async function deleteUser(id) {
  await pool.query("DELETE FROM users WHERE id = ?", [id]);
  return true;
}

export async function findUserWithRelations(id) {
  const [rows] = await pool.query(
    `
    SELECT 
      u.id, 
      u.name, 
      u.email, 
      u.role,
      u.unit_id,
      u.warehouse_id,
      u.avatar_url
    FROM users u
    WHERE u.id = ?
    `,
    [id]
  );

  return rows[0] || null;
}

export async function setInviteTokenByEmail(email, tokenHash, expiresAt) {
  await pool.query(
    `UPDATE users
     SET invite_token_hash = ?, invite_expires_at = ?
     WHERE email = ?`,
    [tokenHash, expiresAt, email]
  );
}

export async function findUserInviteByEmail(email) {
  const [rows] = await pool.query(
    `SELECT id, email, invite_token_hash, invite_expires_at, password_hash
     FROM users
     WHERE email = ?`,
    [email]
  );
  return rows[0] || null;
}

export async function setPasswordAndClearInvite(userId, password_hash) {
  await pool.query(
    `UPDATE users
     SET password_hash = ?, invite_token_hash = NULL, invite_expires_at = NULL
     WHERE id = ?`,
    [password_hash, userId]
  );
}
