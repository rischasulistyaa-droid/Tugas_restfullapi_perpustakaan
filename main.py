from datetime import date, timedelta

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr

from config import supabase

app = FastAPI(title="API Peminjaman Buku Perpustakaan")

# Izinkan frontend React (jalan di port beda) buat akses API ini
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# ===================================================================
# SKEMA INPUT (Pydantic)
# ===================================================================

class UserAuth(BaseModel):
    email: EmailStr
    password: str


class BukuInput(BaseModel):
    judul: str
    penulis: str
    kategori: str
    stok: int


class PeminjamanInput(BaseModel):
    buku_id: int
    nama_peminjam: str
    lama_pinjam_hari: int = 7  # default durasi pinjam 7 hari


# ===================================================================
# AUTH MIDDLEWARE (validasi token JWT ke Supabase)
# ===================================================================

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        user_info = supabase.auth.get_user(token)
        return user_info.user
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token JWT tidak valid atau telah kedaluwarsa",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ===================================================================
# FITUR AUTHENTICATION
# ===================================================================

@app.post("/auth/register", tags=["Authentication"])
def register_user(user: UserAuth):
    try:
        response = supabase.auth.sign_up({
            "email": user.email,
            "password": user.password
        })
        return {"message": "Registrasi akun sukses!", "user_id": response.user.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/auth/login", tags=["Authentication"])
def login_user(user: UserAuth):
    try:
        response = supabase.auth.sign_in_with_password({
            "email": user.email,
            "password": user.password
        })
        return {
            "access_token": response.session.access_token,
            "token_type": "bearer"
        }
    except Exception:
        raise HTTPException(status_code=401, detail="Email atau password Anda salah")


# ===================================================================
# FITUR CRUD BUKU
# ===================================================================

@app.get("/buku", tags=["Buku"])
def get_buku():
    """Lihat semua buku — bisa diakses publik tanpa login."""
    response = supabase.table("buku").select("*").order("judul").execute()
    return response.data


@app.post("/buku", tags=["Buku"])
def create_buku(data: BukuInput, current_user=Depends(get_current_user)):
    """Tambah buku baru — hanya untuk user yang sudah login (misal admin)."""
    try:
        response = supabase.table("buku").insert(data.dict()).execute()
        return {"message": "Buku berhasil ditambahkan", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.put("/buku/{id}", tags=["Buku"])
def update_buku(id: int, data: BukuInput, current_user=Depends(get_current_user)):
    try:
        response = supabase.table("buku").update(data.dict()).eq("id", id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Buku tidak ditemukan")
        return {"message": f"Buku ID {id} berhasil diupdate", "data": response.data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/buku/{id}", tags=["Buku"])
def delete_buku(id: int, current_user=Depends(get_current_user)):
    try:
        response = supabase.table("buku").delete().eq("id", id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Buku tidak ditemukan")
        return {"message": f"Buku ID {id} berhasil dihapus"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ===================================================================
# FITUR PEMINJAMAN (BUSINESS LOGIC UTAMA)
# ===================================================================

def _update_status_terlambat():
    """
    Cek semua peminjaman yang masih 'dipinjam' tapi sudah lewat jatuh_tempo,
    lalu ubah statusnya jadi 'terlambat'. Dipanggil setiap kali GET /peminjaman.
    """
    today = date.today().isoformat()
    supabase.table("peminjaman") \
        .update({"status": "terlambat"}) \
        .eq("status", "dipinjam") \
        .lt("jatuh_tempo", today) \
        .execute()


@app.get("/peminjaman", tags=["Peminjaman"])
def get_peminjaman(current_user=Depends(get_current_user)):
    """Lihat semua riwayat peminjaman — perlu login."""
    _update_status_terlambat()
    response = supabase.table("peminjaman").select("*").order("created_at", desc=True).execute()
    return response.data


@app.post("/peminjaman", tags=["Peminjaman"])
def pinjam_buku(data: PeminjamanInput, current_user=Depends(get_current_user)):
    """
    Proses pinjam buku:
    1. Cek stok buku, harus > 0
    2. Kurangi stok buku sebanyak 1
    3. Buat record peminjaman baru dengan status 'dipinjam'
    """
    try:
        buku_resp = supabase.table("buku").select("*").eq("id", data.buku_id).execute()
        if not buku_resp.data:
            raise HTTPException(status_code=404, detail="Buku tidak ditemukan")

        buku = buku_resp.data[0]
        if buku["stok"] <= 0:
            raise HTTPException(status_code=400, detail="Stok buku habis, tidak bisa dipinjam")

        # Kurangi stok
        supabase.table("buku").update({"stok": buku["stok"] - 1}).eq("id", data.buku_id).execute()

        tanggal_pinjam = date.today()
        jatuh_tempo = tanggal_pinjam + timedelta(days=data.lama_pinjam_hari)

        peminjaman_baru = {
            "buku_id": data.buku_id,
            "user_id": current_user.id,
            "nama_peminjam": data.nama_peminjam,
            "tanggal_pinjam": tanggal_pinjam.isoformat(),
            "jatuh_tempo": jatuh_tempo.isoformat(),
            "status": "dipinjam",
        }
        response = supabase.table("peminjaman").insert(peminjaman_baru).execute()
        return {"message": "Buku berhasil dipinjam", "data": response.data}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.put("/peminjaman/{id}/kembalikan", tags=["Peminjaman"])
def kembalikan_buku(id: int, current_user=Depends(get_current_user)):
    """
    Proses kembalikan buku:
    1. Cari record peminjaman
    2. Update status jadi 'dikembalikan' + isi tanggal_kembali
    3. Tambah stok buku kembali +1
    """
    try:
        peminjaman_resp = supabase.table("peminjaman").select("*").eq("id", id).execute()
        if not peminjaman_resp.data:
            raise HTTPException(status_code=404, detail="Data peminjaman tidak ditemukan")

        peminjaman = peminjaman_resp.data[0]
        if peminjaman["status"] == "dikembalikan":
            raise HTTPException(status_code=400, detail="Buku ini sudah dikembalikan sebelumnya")

        # Update status peminjaman
        supabase.table("peminjaman").update({
            "status": "dikembalikan",
            "tanggal_kembali": date.today().isoformat()
        }).eq("id", id).execute()

        # Tambah stok buku
        buku_resp = supabase.table("buku").select("stok").eq("id", peminjaman["buku_id"]).execute()
        stok_sekarang = buku_resp.data[0]["stok"]
        supabase.table("buku").update({"stok": stok_sekarang + 1}).eq("id", peminjaman["buku_id"]).execute()

        return {"message": "Buku berhasil dikembalikan"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
