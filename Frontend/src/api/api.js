const API_URL = import.meta.env.VITE_API_URL;

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const {
    method = "GET",
    body,
    headers: customHeaders = {},
    ...rest
  } = options;

  const token = getToken();

  // clona pra não mutar objeto externo
  const headers = { ...customHeaders };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // se tiver body (e não for FormData), força JSON
  if (body && !(body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    body,
    headers,
    ...rest,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Erro na requisição");
  }

  return data;
}

export const api = {
  // ---------- Auth ----------
  login: (email, password) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  updateMyProfile: (user) =>
    request("/api/users/me/profile", {
      method: "PUT",
      body: JSON.stringify(user),
    }),
  setPassword: (data) =>
    request("/api/auth/set-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),


  getMyProfile: () => request("/api/users/me"),
  // ---------- Produtos ----------
  getProducts: () => request("/api/produtos"),

  getProductsByWarehouse: (warehouseId) =>
    request(`/api/produtos?warehouse_id=${warehouseId}`),

  inviteUser: (email) =>
    request("/api/auth/invite", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  searchProducts: (q) =>
    request(`/api/produtos?q=${encodeURIComponent(q)}`),

  async createProduct(payload) {
    const res = await request("/api/produtos", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res;
  },

  async updateProduct(id, payload) {
    const res = await request(`/api/produtos/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return res;
  },

  deleteProduct: (id) =>
    request(`/api/produtos/${id}`, {
      method: "DELETE",
    }),

  uploadAvatar: (formData) =>
    request("/api/users/me/avatar", {
      method: "POST",
      body: formData,
    }),


  async getUsers() {
    return request("/api/users");
  },
  // ---------- Estoques ----------

  stockEntryBatch: (payload) =>
    request("/api/estoque/entrada/lote", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  findProductByBarcode: (barcode) => request(`/api/produtos/barcode?barcode=${encodeURIComponent(barcode)}`),

  getWarehouses: () => request("/api/estoques"),

  createWarehouse: (warehouse) =>
    request("/api/estoques", {
      method: "POST",
      body: JSON.stringify(warehouse),
    }),

  updateWarehouse: (id, warehouse) =>
    request(`/api/estoques/${id}`, {
      method: "PUT",
      body: JSON.stringify(warehouse),
    }),

  deleteWarehouse: (id) =>
    request(`/api/estoques/${id}`, {
      method: "DELETE",
    }),

  // --------- Unidades --------

  getUnits: () => request("/api/unidades"),
  createUnit: (unit) => request("/api/unidades", { method: "POST", body: JSON.stringify(unit) }),
  updateUnit: (id, unit) => request(`/api/unidades/${id}`, { method: "PUT", body: JSON.stringify(unit) }),
  deleteUnit: (id) => request(`/api/unidades/${id}`, { method: "DELETE" }),

  // ---------- Usuários (admin / super_admin) ----------
  listUsers: () => request("/api/users"),

  createUser: (user) =>
    request("/api/users", {
      method: "POST",
      body: JSON.stringify(user),
    }),

  updateUser: (id, user) =>
    request(`/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(user),
    }),

  deleteUser: (id) =>
    request(`/api/users/${id}`, {
      method: "DELETE",
    }),

  // ---------- Movimentações ----------
  stockEntry: (payload) =>
    request("/api/estoque/entrada", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  stockExit: (payload) =>
    request("/api/estoque/saida", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  stockReport: () => request("/api/relatorios/estoque"),
  movementReport: () => request("/api/relatorios/movimentacoes"),

  dashboardSummary: () => request("/api/dashboard/resumo"),

  listExitOrders: () => request("/api/os-saida"),

  signExitOrder: (id, signatureDataUrl) =>
    request(`/api/os-saida/${id}/assinar`, {
      method: "POST",
      body: JSON.stringify({ signatureDataUrl }),
    }),
};

export { API_URL };
