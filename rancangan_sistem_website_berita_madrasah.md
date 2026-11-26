# Rancangan Sistem: Website Berita & Portal Informasi Madrasah

**Tech Stack:** React (Vite) + Tailwind CSS + Supabase (BaaS)  
**Target Hosting:** Shared Hosting / cPanel (Static Build Deployment)

---

## 1. Arsitektur Sistem

Karena target *deployment* adalah **cPanel** (yang umumnya dirancang untuk *static hosting* atau PHP), pendekatan terbaik adalah menggunakan arsitektur **JAMstack / Single Page Application (SPA)**. 

* **Frontend:** Dibangun menggunakan React + Vite. Setelah proses *build* (`npm run build`), aplikasi akan menghasilkan file statis (`index.html`, `.js`, `.css`, dan aset gambar) di dalam folder `dist/`. File-file inilah yang diunggah ke `public_html` di cPanel.
* **Backend & Database:** Ditangani sepenuhnya oleh **Supabase** (PostgreSQL, Authentication, Storage, dan Auto-generated REST/GraphQL API). Frontend berkomunikasi langsung dengan Supabase melalui `@supabase/supabase-js` menggunakan *Anon Public Key* yang diamankan dengan *Row Level Security* (RLS).

```
[ Pengunjung / Admin ] 
         │
         ▼ (HTTPS)
[ cPanel (Apache/LiteSpeed) ] ──► Menyajikan file statis (React SPA)
         │
         ▼ (API Calls via supabase-js)
[ Supabase Cloud ]
   ├── Auth (Login Admin & Jurnalis Siswa/Guru)
   ├── PostgreSQL Database (Data Berita, Kategori, Pengumuman)
   └── Storage Bucket (Gambar Thumbnail, Galeri Kegiatan)
```

---

## 2. Kebutuhan Fungsional & Role Pengguna

### A. Pengunjung Umum (Public - Tanpa Login)
* Melihat *Headline* / Berita Utama madrasah.
* Membaca artikel berita berdasarkan kategori (Kegiatan, Prestasi, Pengumuman, Opini Siswa, Artikel Islami).
* Mencari berita berdasarkan kata kunci (*Search*).
* Melihat galeri foto kegiatan dan agenda madrasah.
* Membagikan berita ke media sosial (WhatsApp, Facebook, Copy Link).

### B. Penulis / Jurnalis (Guru & Ekskul Jurnalistik Siswa)
* Login ke Dashboard CMS.
* Membuat, mengedit, dan menyimpan draf berita miliknya sendiri.
* Mengunggah gambar *thumbnail* berita.
* Mengajukan berita untuk ditinjau (*Status: Pending Review*).

### C. Admin Utama (Humas / Operator Madrasah)
* Memiliki semua akses Penulis.
* Menyetujui (*Publish*) atau menolak berita dari Penulis.
* Mengelola kategori berita dan agenda madrasah.
* Mengelola akun pengguna (menambah/menonaktifkan akun guru/siswa).
* Mengatur profil madrasah (Sambutan Kepala Madrasah, Kontak, Link PPDB).

---

## 3. Desain Database (Supabase PostgreSQL)

Berikut adalah skema tabel utama yang perlu dibuat di **Supabase SQL Editor**:

### 1. Tabel `profiles` (Ekstensi dari `auth.users`)
Menyimpan data profil admin dan penulis.
```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'writer')) DEFAULT 'writer',
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Tabel `categories`
Menyimpan kategori berita madrasah.
```sql
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. Tabel `posts` (Tabel Utama Berita)
Menyimpan seluruh konten berita dan pengumuman.
```sql
CREATE TABLE public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL, -- Menyimpan format HTML/Markdown dari Rich Text Editor
  thumbnail_url TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('draft', 'pending', 'published')) DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT FALSE, -- Untuk slider berita utama
  views_count INT DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Tabel `agendas` (Agenda & Pengumuman Singkat)
Menyimpan jadwal ujian, libur, atau kegiatan madrasah.
```sql
CREATE TABLE public.agendas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  location TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. Keamanan Database (Row Level Security / RLS)

Karena API Key Supabase terekspos di sisi *client* (React), **RLS wajib diaktifkan** pada semua tabel:

* **Tabel `posts`:**
  * `SELECT`: Publik hanya bisa membaca baris dengan `status = 'published'`. Penulis bisa membaca miliknya sendiri. Admin bisa membaca semua.
  * `INSERT`: Hanya user yang sudah login (`auth.uid() IS NOT NULL`).
  * `UPDATE`: Penulis hanya bisa mengedit post miliknya (`auth.uid() = author_id`), Admin bisa mengedit semua.
  * `DELETE`: Hanya Admin (`role = 'admin'`).
* **Supabase Storage (Bucket `news-images`):**
  * Atur bucket menjadi **Public** untuk membaca gambar.
  * Policy `INSERT` dan `DELETE` hanya diizinkan untuk *authenticated users*.

---

## 5. Struktur Folder Proyek (React + Vite)

Struktur proyek yang modular agar mudah dikelola:

```text
madrasah-news/
├── public/
│   ├── .htaccess               <-- WAJIB untuk routing SPA di cPanel
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── common/             <-- Navbar, Footer, Loader, SEOHead
│   │   ├── public/             <-- NewsCard, HeroSlider, SidebarAgenda
│   │   └── admin/              <-- RichTextEditor, ImageUploader, SidebarAdmin
│   ├── context/
│   │   └── AuthContext.jsx     <-- Manajemen sesi login Supabase
│   ├── lib/
│   │   └── supabaseClient.js   <-- Inisialisasi koneksi Supabase
│   ├── pages/
│   │   ├── public/
│   │   │   ├── Home.jsx
│   │   │   ├── NewsDetail.jsx
│   │   │   ├── CategoryPage.jsx
│   │   │   └── SearchPage.jsx
│   │   └── admin/
│   │       ├── Login.jsx
│   │       ├── Dashboard.jsx
│   │       ├── PostList.jsx
│   │       ├── PostEditor.jsx
│   │       └── ManageCategories.jsx
│   ├── utils/
│   │   ├── formatDate.js       <-- Format tanggal Indonesia & Hijriah (opsional)
│   │   └── slugify.js          <-- Mengubah judul menjadi URL slug
│   ├── App.jsx                 <-- Konfigurasi React Router
│   └── main.jsx
├── .env                        <-- Variabel VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY
├── package.json
└── vite.config.js
```

---

## 6. Rekomendasi Library Pendukung

1. **Routing:** `react-router-dom` (Gunakan `BrowserRouter`).
2. **Styling:** `tailwindcss` + `@tailwindcss/typography` (Sangat berguna untuk merapikan tampilan artikel berita secara otomatis menggunakan class `prose`).
3. **Icons:** `lucide-react` (Ringan dan modern).
4. **Rich Text Editor:** `react-quill-new` atau `@tiptap/react` (Untuk menulis berita dengan format tebal, miring, list, dan kutipan ayat/hadis).
5. **Kompresi Gambar (Client-side):** `browser-image-compression` (Penting agar gambar yang diunggah guru/siswa otomatis dikompres menjadi < 300KB sebelum masuk ke Supabase Storage, sehingga menghemat kuota *free tier*).
6. **SEO & Meta Tags:** `react-helmet-async` (Untuk mengatur judul tab browser saat membuka berita tertentu).

---

## 7. Konfigurasi Khusus untuk cPanel (Sangat Penting!)

Aplikasi React menggunakan *Client-Side Routing* (misal: `madrasah.sch.id/berita/juara-osn`). Jika pengunjung me-refresh halaman tersebut di cPanel, server Apache/LiteSpeed akan mencari folder fisik `/berita/juara-osn` dan menghasilkan error **404 Not Found**.

Untuk mengatasi hal ini dan memastikan kompatibilitas penuh di cPanel:

### A. Konfigurasi `vite.config.js`
Pastikan `base` diatur ke `'./'` atau `'/'` (jika di-deploy di root domain `public_html`).

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // Ubah menjadi '/nama-subfolder/' jika ditaruh di dalam subfolder cPanel
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})
```

### B. Pembuatan File `.htaccess` di Folder `public/`
Buat file bernama `.htaccess` di dalam folder `public/` proyek React Anda. Saat dijalankan perintah `npm run build`, Vite akan otomatis menyalin file ini ke dalam folder `dist/`.

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Jangan rewrite jika file atau direktori fisik memang ada
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  
  # Arahkan semua request lainnya ke index.html (React Router)
  RewriteRule . /index.html [L]
</IfModule>

# Optimasi Caching untuk aset statis Vite di cPanel
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

---

## 8. Alur Deployment ke cPanel

1. **Siapkan Environment Variables:**
   Pastikan file `.env` sudah terisi dengan kredensial proyek Supabase Anda:
   ```env
   VITE_SUPABASE_URL=https://xyzcompany.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
2. **Build Proyek di Lokal:**
   Jalankan perintah di terminal:
   ```bash
   npm run build
   ```
   Perintah ini akan mengompilasi kode dan menanamkan variabel `.env` ke dalam file hasil build di folder `dist/`.
3. **Kompres Folder `dist/`:**
   Masuk ke dalam folder `dist/`, pilih semua file di dalamnya (`index.html`, `.htaccess`, folder `assets/`), lalu jadikan satu file `.zip` (misalnya `madrasah-web.zip`).
   *(Catatan: Jangan men-zip folder `dist`-nya, tapi isi di dalam folder `dist` tersebut).*
4. **Upload ke cPanel:**
   * Login ke **cPanel** hosting madrasah.
   * Buka **File Manager** -> masuk ke direktori `public_html` (atau direktori subdomain).
   * Klik **Upload** dan unggah file `madrasah-web.zip`.
   * Klik kanan pada file `.zip` tersebut -> pilih **Extract**.
   * Pastikan file `.htaccess` terlihat (jika tidak terlihat, klik tombol **Settings** di pojok kanan atas File Manager cPanel dan centang *"Show Hidden Files (dotfiles)"*).
5. **Konfigurasi Redirect URL di Supabase:**
   * Buka Dashboard Supabase -> **Authentication** -> **URL Configuration**.
   * Masukkan domain cPanel madrasah (contoh: `https://berita.man1contoh.sch.id`) pada bagian **Site URL** dan **Redirect URLs** agar fitur reset password atau konfirmasi email berjalan lancar.

---

## 9. Roadmap Pengembangan (Tahapan Pengerjaan)

* **Fase 1 (Setup & Database):** Inisialisasi Vite + Tailwind, setup proyek Supabase, eksekusi SQL tabel, dan pengaturan RLS serta Storage Bucket.
* **Fase 2 (Autentikasi & CMS Admin):** Pembuatan halaman Login, proteksi rute admin, CRUD Kategori, dan pembuatan *Post Editor* lengkap dengan fitur kompresi gambar.
* **Fase 3 (Halaman Publik):** Pembuatan halaman Beranda (*Hero Slider*, Berita Terbaru, Sidebar Agenda), halaman Detail Berita, Kategori, dan Pencarian.
* **Fase 4 (Optimasi & Deployment):** Penambahan *skeleton loading*, optimasi meta tag, pengujian *build* lokal (`npm run preview`), dan unggah ke cPanel.