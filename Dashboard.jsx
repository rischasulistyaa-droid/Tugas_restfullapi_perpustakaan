import { useState, useEffect } from "react";
import {
  getBuku, createBuku, updateBuku, deleteBuku,
  getPeminjaman, pinjamBuku, kembalikanBuku,
} from "../api";
import BukuForm from "../components/BukuForm";
import BukuList from "../components/BukuList";
import PeminjamanList from "../components/PeminjamanList";

export default function Dashboard({ onLogout }) {
  const [tab, setTab] = useState("buku"); // "buku" atau "peminjaman"
  const [daftarBuku, setDaftarBuku] = useState([]);
  const [daftarPeminjaman, setDaftarPeminjaman] = useState([]);
  const [bukuEdit, setBukuEdit] = useState(null);
  const [pesanError, setPesanError] = useState("");

  async function muatBuku() {
    try {
      setDaftarBuku(await getBuku());
    } catch (err) {
      setPesanError(err.message);
    }
  }

  async function muatPeminjaman() {
    try {
      setDaftarPeminjaman(await getPeminjaman());
    } catch (err) {
      setPesanError(err.message);
    }
  }

  // Muat data pertama kali halaman dibuka
  useEffect(() => {
    muatBuku();
    muatPeminjaman();
  }, []);

  async function handleSimpanBuku(data) {
    try {
      if (bukuEdit) {
        await updateBuku(bukuEdit.id, data);
      } else {
        await createBuku(data);
      }
      setBukuEdit(null);
      muatBuku();
    } catch (err) {
      setPesanError(err.message);
    }
  }

  async function handleHapusBuku(id) {
    if (!confirm("Yakin ingin menghapus buku ini?")) return;
    try {
      await deleteBuku(id);
      muatBuku();
    } catch (err) {
      setPesanError(err.message);
    }
  }

  async function handlePinjam(buku) {
    const nama = prompt(`Atas nama siapa peminjaman buku "${buku.judul}" ini?`);
    if (!nama) return;
    try {
      await pinjamBuku({ buku_id: buku.id, nama_peminjam: nama, lama_pinjam_hari: 7 });
      muatBuku();
      muatPeminjaman();
    } catch (err) {
      setPesanError(err.message);
    }
  }

  async function handleKembalikan(id) {
    try {
      await kembalikanBuku(id);
      muatBuku();
      muatPeminjaman();
    } catch (err) {
      setPesanError(err.message);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    onLogout();
  }

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.6rem" }}>Perpustakaan Digital</h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--warna-teks-pudar)" }}>
            Kelola koleksi buku dan riwayat peminjaman
          </p>
        </div>
        <button className="btn-tepi" onClick={handleLogout}>Keluar</button>
      </header>

      <nav style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <button
          className={tab === "buku" ? "btn-utama" : "btn-tepi"}
          onClick={() => setTab("buku")}
        >
          Daftar Buku
        </button>
        <button
          className={tab === "peminjaman" ? "btn-utama" : "btn-tepi"}
          onClick={() => setTab("peminjaman")}
        >
          Riwayat Peminjaman
        </button>
      </nav>

      {pesanError && (
        <p style={{ color: "var(--warna-bahaya)", fontSize: "0.85rem" }} onClick={() => setPesanError("")}>
          {pesanError} (klik untuk tutup)
        </p>
      )}

      {tab === "buku" && (
        <>
          <BukuForm
            bukuEdit={bukuEdit}
            onSimpan={handleSimpanBuku}
            onBatal={() => setBukuEdit(null)}
          />
          <BukuList
            daftarBuku={daftarBuku}
            isLogin={true}
            onPinjam={handlePinjam}
            onEdit={setBukuEdit}
            onHapus={handleHapusBuku}
          />
        </>
      )}

      {tab === "peminjaman" && (
        <PeminjamanList
          daftarPeminjaman={daftarPeminjaman}
          daftarBuku={daftarBuku}
          onKembalikan={handleKembalikan}
        />
      )}
    </div>
  );
}
