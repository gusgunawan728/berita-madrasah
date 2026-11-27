# Portal Berita Madrasah

Portal berita madrasah berbasis **React + Vite + Tailwind CSS + Supabase**. Sie static SPA (JAMstack): hasil build berupa folder `dist/` yang cukup diunggah ke `public_html` di cPanel. Sisi publik menampilkan berita, kategori, pencarian, agenda, galeri, dan pembagian tautan. Sisi CMS memungkinkan guru/siswa menulis draft serta admin meninjau, menolak, dan menerbitkan berita.

> **Status saat ini:** aplikasi berjalan dalam **mode demo** bila `.env` belum diisi. Semua berita, agenda, galeri, dan akun adalah data contoh "Madrasah Al-Hikmah". Ganti dengan data madrasah sebelum publish.

## 1. Menjalankan secara lokal

```bash
npm install
cp .env.example .env      # lalu isi dengan kredensial Supabase Anda
npm run dev
```

Buka alamat yang ditampilkan Vite. Untuk memproduksikan berkas:

```bash
npm run build             # hasil ada di dist/
npm run preview           # opsional, menguji hasil build secara lokal
```

## 2. Menyiapkan Supabase

Tidak ada koneksi Supabase langsung dari sesi pengembangan ini. Jalankan skrip SQL berikut **manual** di Supabase Dashboard → **SQL Editor → New query**, lalu **Run**:

```
supabase/schema.sql
```

Skrip ini membuat tabel `profiles`, `categories`, `posts`, `agendas`, `gallery`, `site_settings`, mengaktifkan **RLS** pada semua tabel, membuat fungsi `is_admin()`, trigger profil otomatis, kebijakan storage, serta data awal kategori dan profil madrasah.

Langkah berikutnya di Dashboard Supabase:

1. **Authentication → Providers → Email**：aktifkan, dan tentukan apakah konfirmasi email diperlukan.
2. **Authentication → Add user**：buat akun admin dan akun penulis. Centang *Auto Confirm* agar bisa langsung masuk.
3. Setelah akun admin dibuat, jalankan di SQL Editor:

   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'admin@madrasah-anda.sch.id');
   ```

   Akun yang dibuat lewat *Add user* otomatis mendapat `role = 'writer'` melalui trigger.
4. **Authentication → URL Configuration**：isi *Site URL* dengan `https://domain-anda/**` dan tambahkan `https://domain-anda/admin/login` serta `https://domain-anda/**` ke *Redirect URLs*.
5. **Storage**：skrip sudah membuat bucket publik `news-images` (maks. 5 MB, hanya gambar). Gambar unggahan CMS disimpan dalam folder `id-pengguna/`.

Salin nilai Project URL dan *anon/publishable key* ke `.env`:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

**Jangan** memasukkan *service role key* ke `.env`, kode browser, atau file mana pun yang diunggah ke cPanel. Kunci anon aman karena akses dijaga RLS.

### Mode demo

Jika salah satu variabel `.env` kosong, masih berisi nilai contoh `xyzcompany`, atau *anon key* terlalu pendek, aplikasi otomatis memakai data contoh di `src/data/demoData.js`. Akun demo:

| Peran | Email | Kata sandi |
| --- | --- | --- |
| Admin | `admin@alhikmah.sch.id` | `demo1234` |
| Guru | `guru@alhikmah.sch.id` | `demo1234` |
| Siswa | `siswa@alhikmah.sch.id` | `demo1234` |

Banner demo di bagian atas situs hilang dengan sendirinya setelah `.env` berisi kredensial yang valid dan aplikasi di-build ulang.

## 3. Publishing ke cPanel

1. Isi `.env` dengan kredensial Supabase yang sudah disiapkan.
2. Jalankan `npm run build`.
3. Di **cPanel → File Manager**, buka `public_html` (atau folder domain yang digunakan).
4. Unggah **isi** folder `dist/`, bukan folder `dist/` itu sendiri. `index.html` harus berada langsung di `public_html`.
5. Pastikan `.htaccess` ikut terunggah. Di File Manager aktifkan *Show Hidden Files*. Berkas ini mengarahkan semua rute React Router ke `index.html` dan mengatur cache aset. Jika hosting tidak mendukung `mod_rewrite` / LiteSpeed rewrite, hubungi penyedia hosting.
6. Aktifkan SSL dan buka situs dengan `https://`. Perbarui *Site URL* dan *Redirect URLs* di Supabase sesuai domain final.
7. Uji rute langsung seperti `https://domain-anda/agenda` dan `https://domain-anda/admin/login` setelah unggah. Keduanya harus menampilkan halaman yang benar, bukan 404.

React Router memakai path absolut (`base: '/'`), cocok untuk domain/root `public_html`. Jika aplikasi ditempatkan di subfolder, ubah `base` di `vite.config.js`, `RewriteBase`, dan aturan rewrite di `.htaccess`.

## 4. Alur kerja CMS

- **Penulis** (`writer`): membuat berita sebagai draft, mengunggah gambar, mengirim untuk ditinjau (`submit`). Tulisan yang ditolak dapat diperbaiki dan dikirim lagi.
- **Admin** (`admin`): menyetujui, menolak, atau menerbitkan berita; mengelola kategori, agenda, galeri, pengguna, dan profil madrasah.
- Hanya berita berstatus `published` yang tampil di situs publik. `getPosts()` secara default mengambil yang sudah terbit; `getPosts({ status: 'all' })` hanya dipakai di CMS.

## 5. Sebelum publish, ganti ini

- Nama madrasah, alamat, telepon, email, tautan PPDB, sambutan kepala madrasah, dan kota di `supabase/schema.sql` → `site_settings` (atau melalui CMS → **Profil**).
- Seluruh judul, isi, agenda, dan caption contoh di `src/data/demoData.js` serta data awal di `supabase/schema.sql`.
- Foto contoh di `public/images/` dengan dokumentasi kegiatan madrasah yang sebenarnya.
- Kata sandi akun demo dan akun Supabase.
- Baris kredit foto di `src/components/common/Footer.jsx` bila foto diganti. Catatan sumber dan lisensi ada di `assets/credits.json`.

### Kredit foto contoh

Foto-foto contoh berasal dari Wikimedia Commons / Openverse dan **bukan** foto Madrasah Al-Hikmah. Kredit ringkas tampil di footer situs; rincian judul, pembuat, lisensi, dan tautan sumber ada di `assets/credits.json`:

- "Kegiatan Rangking 1 di MTs Negeri Tungkob" · Rachmat.Wahidi · CC BY-SA 3.0
- "Art made out of recycling and used materials" · USAID Indonesia · public domain
- "Children working together at school" · USAID Indonesia · public domain
- "Decentralized Basic Education in Indonesia" · USAID Indonesia · public domain
- "Elementary students reciting Al Quran in school" · rachmatwhd · CC BY-SA 2.0
- "Flag Ceremony at School in Indonesia" · Aina Aiikyo · CC BY-SA 3.0
- "Upacara bendera di SMP Kartika" · Moch Nesha AR · CC BY-SA 3.0

Beberapa lisensi CC BY-SA mensyaratkan atribusi dan share-alike bila foto diubah. Periksa kembali `assets/credits.json` sebelum menghapus kredit.
