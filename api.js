// Alamat backend FastAPI. Ganti kalau backend kamu jalan di port/host lain.
const BASE_URL = "http://127.0.0.1:8000";

// Ambil token yang tersimpan setelah login
function getToken() {
  return localStorage.getItem("token");
}

// Helper umum untuk request ke backend
async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // FastAPI mengirim error di field "detail"
    throw new Error(data?.detail || "Terjadi kesalahan pada server");
  }

  return data;
}

// ===== AUTH =====
export const register = (email, password) =>
  request("/auth/register", { method: "POST", body: { email, password } });

export const login = (email, password) =>
  request("/auth/login", { method: "POST", body: { email, password } });

// ===== BUKU =====
export const getBuku = () => request("/buku");

export const createBuku = (data) =>
  request("/buku", { method: "POST", body: data, auth: true });

export const updateBuku = (id, data) =>
  request(`/buku/${id}`, { method: "PUT", body: data, auth: true });

export const deleteBuku = (id) =>
  request(`/buku/${id}`, { method: "DELETE", auth: true });

// ===== PEMINJAMAN =====
export const getPeminjaman = () => request("/peminjaman", { auth: true });

export const pinjamBuku = (data) =>
  request("/peminjaman", { method: "POST", body: data, auth: true });

export const kembalikanBuku = (id) =>
  request(`/peminjaman/${id}/kembalikan`, { method: "PUT", auth: true });
