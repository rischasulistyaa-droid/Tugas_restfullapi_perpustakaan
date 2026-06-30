const LABEL_STATUS = {
  dipinjam: { teks: "Dipinjam", kelas: "label-dipinjam" },
  dikembalikan: { teks: "Dikembalikan", kelas: "label-dikembalikan" },
  terlambat: { teks: "Terlambat", kelas: "label-terlambat" },
};

export default function PeminjamanList({ daftarPeminjaman, daftarBuku, onKembalikan }) {
  if (daftarPeminjaman.length === 0) {
    return <p style={{ color: "var(--warna-teks-pudar)" }}>Belum ada riwayat peminjaman.</p>;
  }

  function cariJudulBuku(bukuId) {
    const buku = daftarBuku.find((b) => b.id === bukuId);
    return buku ? buku.judul : `Buku #${bukuId}`;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {daftarPeminjaman.map((p) => {
        const status = LABEL_STATUS[p.status] || LABEL_STATUS.dipinjam;
        return (
          <div
            key={p.id}
            className="kartu"
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}
          >
            <div>
              <p style={{ margin: 0, fontWeight: 500 }}>{cariJudulBuku(p.buku_id)}</p>
              <p style={{ margin: "0.2rem 0 0", fontSize: "0.8rem", color: "var(--warna-teks-pudar)" }}>
                Peminjam: {p.nama_peminjam} &middot; Jatuh tempo: {p.jatuh_tempo}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span className={`label-status ${status.kelas}`}>{status.teks}</span>
              {p.status !== "dikembalikan" && (
                <button className="btn-tepi" style={{ fontSize: "0.8rem" }} onClick={() => onKembalikan(p.id)}>
                  Tandai Dikembalikan
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
