-- =========================================================
-- SETUP DATABASE: SISTEM PEMINJAMAN BUKU PERPUSTAKAAN
-- Jalankan di Supabase Dashboard > SQL Editor
-- =========================================================

-- 1. TABEL BUKU
create table if not exists buku (
    id bigint generated always as identity primary key,
    judul text not null,
    penulis text not null,
    kategori text not null,
    stok integer not null default 0 check (stok >= 0),
    created_at timestamp with time zone default now()
);

-- 2. TABEL PEMINJAMAN
create table if not exists peminjaman (
    id bigint generated always as identity primary key,
    buku_id bigint not null references buku(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    nama_peminjam text not null,
    tanggal_pinjam date not null default current_date,
    tanggal_kembali date,            -- diisi null saat baru pinjam, diisi tanggal saat dikembalikan
    jatuh_tempo date not null,       -- batas waktu pengembalian
    status text not null default 'dipinjam' check (status in ('dipinjam', 'dikembalikan', 'terlambat')),
    created_at timestamp with time zone default now()
);

-- 3. Index biar query lebih cepat saat filter berdasarkan buku/status
create index if not exists idx_peminjaman_buku_id on peminjaman(buku_id);
create index if not exists idx_peminjaman_status on peminjaman(status);

-- 4. Data contoh (opsional, biar ada isinya waktu testing)
insert into buku (judul, penulis, kategori, stok) values
('Laskar Pelangi', 'Andrea Hirata', 'Fiksi', 5),
('Bumi Manusia', 'Pramoedya Ananta Toer', 'Fiksi', 3),
('Filosofi Teras', 'Henry Manampiring', 'Pengembangan Diri', 7),
('Sapiens', 'Yuval Noah Harari', 'Sejarah', 4);
