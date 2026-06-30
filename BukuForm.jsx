import { useState, useEffect } from "react";

const KOSONG = { judul: "", penulis: "", kategori: "", stok: 1 };

export default function BukuForm({ bukuEdit, onSimpan, onBatal }) {
  const [form, setForm] = useState(KOSONG);

  // Kalau ada bukuEdit (mode edit), isi form dengan data tersebut
  useEffect(() => {
    setForm(bukuEdit || KOSONG);
  }, [bukuEdit]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "stok" ? Number(value) : value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSimpan(form);
    setForm(KOSONG);
  }

  return (
    <form onSubmit={handleSubmit} className="kartu" style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
      <h3>{bukuEdit ? "Edit Buku" : "Tambah Buku Baru"}</h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <input name="judul" placeholder="Judul buku" value={form.judul} onChange={handleChange} required />
        <input name="penulis" placeholder="Penulis" value={form.penulis} onChange={handleChange} required />
        <input name="kategori" placeholder="Kategori" value={form.kategori} onChange={handleChange} required />
        <input name="stok" type="number" min="0" placeholder="Stok" value={form.stok} onChange={handleChange} required />
      </div>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button type="submit" className="btn-utama">
          {bukuEdit ? "Simpan Perubahan" : "Tambah Buku"}
        </button>
        {bukuEdit && (
          <button type="button" className="btn-tepi" onClick={onBatal}>
            Batal
          </button>
        )}
      </div>
    </form>
  );
}
