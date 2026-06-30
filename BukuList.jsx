export default function BukuList({ daftarBuku, isLogin, onPinjam, onEdit, onHapus }) {
  if (daftarBuku.length === 0) {
    return <p style={{ color: "var(--warna-teks-pudar)" }}>Belum ada buku yang terdaftar.</p>;
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" }}>
      {daftarBuku.map((buku) => (
        <div key={buku.id} className="kartu" style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <h3 style={{ fontSize: "1.05rem" }}>{buku.judul}</h3>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--warna-teks-pudar)" }}>{buku.penulis}</p>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--warna-teks-pudar)" }}>{buku.kategori}</p>

          <p style={{ margin: "0.4rem 0", fontSize: "0.85rem" }}>
            Stok: <strong>{buku.stok}</strong>
          </p>

          {isLogin && (
            <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.4rem", flexWrap: "wrap" }}>
              <button
                className="btn-utama"
                disabled={buku.stok <= 0}
                onClick={() => onPinjam(buku)}
                style={{ fontSize: "0.8rem" }}
              >
                {buku.stok <= 0 ? "Stok habis" : "Pinjam"}
              </button>
              <button className="btn-tepi" onClick={() => onEdit(buku)} style={{ fontSize: "0.8rem" }}>
                Edit
              </button>
              <button className="btn-bahaya" onClick={() => onHapus(buku.id)} style={{ fontSize: "0.8rem" }}>
                Hapus
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
