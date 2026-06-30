import { useState } from "react";
import { login, register } from "../api";

export default function LoginForm({ onLoginSuccess }) {
  const [mode, setMode] = useState("login"); // "login" atau "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pesan, setPesan] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setPesan("");
    setLoading(true);

    try {
      if (mode === "login") {
        const hasil = await login(email, password);
        localStorage.setItem("token", hasil.access_token);
        onLoginSuccess();
      } else {
        await register(email, password);
        setPesan("Registrasi berhasil. Silakan login.");
        setMode("login");
      }
    } catch (err) {
      setPesan(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="kartu" style={{ maxWidth: 380, margin: "4rem auto" }}>
      <h2 style={{ marginBottom: "0.25rem" }}>
        {mode === "login" ? "Masuk ke Perpustakaan" : "Daftar Akun Baru"}
      </h2>
      <p style={{ color: "var(--warna-teks-pudar)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
        {mode === "login"
          ? "Masuk untuk meminjam dan mengelola buku."
          : "Buat akun untuk mulai meminjam buku."}
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <input
          type="email"
          placeholder="Alamat email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Kata sandi"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        {pesan && (
          <p style={{ fontSize: "0.85rem", color: "var(--warna-bahaya)", margin: 0 }}>{pesan}</p>
        )}

        <button type="submit" className="btn-utama" disabled={loading}>
          {loading ? "Memproses..." : mode === "login" ? "Masuk" : "Daftar"}
        </button>
      </form>

      <p style={{ fontSize: "0.85rem", marginTop: "1rem", textAlign: "center" }}>
        {mode === "login" ? "Belum punya akun? " : "Sudah punya akun? "}
        <button
          type="button"
          className="btn-tepi"
          style={{ padding: "0.2rem 0.6rem", fontSize: "0.85rem" }}
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setPesan("");
          }}
        >
          {mode === "login" ? "Daftar di sini" : "Masuk di sini"}
        </button>
      </p>
    </div>
  );
}
