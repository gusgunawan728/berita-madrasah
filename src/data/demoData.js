// Konten contoh untuk MODE DEMO. Ganti dengan data Supabase setelah kredensial diisi.
const img = (name) => `${import.meta.env.BASE_URL}images/${name}`

export const demoCategories = [
  { id: 'c-kegiatan', name: 'Kegiatan', slug: 'kegiatan', description: 'Kegiatan belajar mengajar dan ekstrakurikuler madrasah' },
  { id: 'c-prestasi', name: 'Prestasi', slug: 'prestasi', description: 'Prestasi siswa dan guru di bidang akademik maupun non-akademik' },
  { id: 'c-pengumuman', name: 'Pengumuman', slug: 'pengumuman', description: 'Pengumuman resmi untuk warga madrasah dan orang tua' },
  { id: 'c-opini', name: 'Opini Siswa', slug: 'opini-siswa', description: 'Tulisan dan sudut pandang siswa' },
  { id: 'c-islami', name: 'Artikel Islami', slug: 'artikel-islami', description: 'Artikel keagamaan, tilawah, dan hikmah harian' },
]

export const demoAuthors = [
  { id: 'u-admin', full_name: 'Nur Aisyah', avatar_url: null, bio: 'Operator Humas madrasah' },
  { id: 'u-writer-1', full_name: 'Rizky Ramadhan', avatar_url: null, bio: 'Guru Matematika & pembina jurnalistik' },
  { id: 'u-writer-2', full_name: 'Fatimah Azzahra', avatar_url: null, bio: 'Siswa kelas XI, ekskul jurnalistik' },
]

export const demoUsers = [
  { id: 'u-admin', email: 'admin@madrasahdigital.sch.id', password: 'demo1234', role: 'admin', full_name: 'Nur Aisyah' },
  { id: 'u-writer-1', email: 'guru@madrasahdigital.sch.id', password: 'demo1234', role: 'writer', full_name: 'Rizky Ramadhan' },
  { id: 'u-writer-2', email: 'siswa@madrasahdigital.sch.id', password: 'demo1234', role: 'writer', full_name: 'Fatimah Azzahra' },
]

export const demoPosts = [
  {
    id: 'p-1',
    title: 'Siswa Madrasah Digital Raih Juara OSN Matematika',
    slug: 'juara-osn-matematika-2026',
    excerpt: 'Dari 128 peserta tingkat kota, dua siswa Madrasah Digital berhasil membawa pulang medali emas dan perunggu.',
    content: `<p>Kabar baik datang dari arena Olimpiade Sains Nasional tingkat kota. Dua siswa Madrasah Digital, <strong>Ahmad Fauzan</strong> dan <strong>Salsabila Putri</strong>, berhasil meraih medali emas dan perunggu untuk bidang Matematika setelah melewati tiga babak penyisihan.</p>
      <p>Keduanya telah menjalani persiapan intensif selama empat bulan bersama pembina ekstrakurikuler sains. Latihan harian mencakup penyelesaian soal tahun sebelumnya, diskusi kelompok, dan simulasi ujian setiap Sabtu pagi.</p>
      <blockquote>“Kunci utamanya bukan mengerjakan banyak soal, tetapi memahami pola pikir di balik setiap soal,” kata Fauzan usai pengumuman hasil.</blockquote>
      <p>Pencapaian ini menjadi syarat untuk mengikuti seleksi tingkat provinsi yang akan diselenggarakan pada bulan Desember. Selamat kepada kedua siswa, dan terima kasih kepada seluruh guru yang mendampingi.</p>`,
    thumbnail_url: img('kegiatan-rangking-1-di-madrasah-tsanawiyah-negeri.jpg'),
    category_id: 'c-prestasi',
    author_id: 'u-writer-1',
    status: 'published',
    is_featured: true,
    views_count: 1842,
    published_at: '2026-11-24T08:30:00+07:00',
    created_at: '2026-11-23T10:00:00+07:00',
    updated_at: '2026-11-24T08:30:00+07:00',
  },
  {
    id: 'p-2',
    title: 'Madrasah Digital Pasang Papan Pengumuman Digital',
    slug: 'papan-pengumuman-digital',
    excerpt: 'Kini jadwal pelajaran, agenda, dan pengumuman bisa dilihat warga madrasah dalam satu layar di koridor utama.',
    content: `<p>Mulai Senin lalu, koridor utama Madrasah Digital memiliki papan pengumuman digital. Layar tersebut menampilkan jadwal pelajaran harian, agenda mendatang, dan pengumuman resmi dari Humas.</p>
      <p>Papan ini menggantikan sebagian pengumuman cetak yang sebelumnya harus dicetak ulang setiap hari. Operator madrasah dapat memperbarui isi layar dari dashboard CMS Madrasah Digital, sementara siswa tetap bisa membaca versi web di portal berita.</p>
      <p>Penggunaan papan digital merupakan bagian dari program digitalisasi madrasah sekaligus kegiatan ramah lingkungan. Kertas yang sebelumnya dipakai untuk pengumuman harian kini bisa ditekan penggunaannya hingga ratusan lembar per bulan.</p>`,
    thumbnail_url: img('decentralized-basic-education-in-indonesia.jpg'),
    category_id: 'c-kegiatan',
    author_id: 'u-admin',
    status: 'published',
    is_featured: true,
    views_count: 967,
    published_at: '2026-11-22T14:00:00+07:00',
    created_at: '2026-11-22T09:00:00+07:00',
    updated_at: '2026-11-22T14:00:00+07:00',
  },
  {
    id: 'p-3',
    title: 'Jadwal Ujian Tengah Semester Ganjil 2026/2027',
    slug: 'jadwal-uts-ganjil-2026-2027',
    excerpt: 'Ujian berlangsung 8–12 Desember. Siswa diminta mengecek jadwal per mapel melalui portal Madrasah Digital.',
    content: `<p>Dengan hormat, diinformasikan bahwa Ujian Tengah Semester Ganjil Tahun Ajaran 2026/2027 akan diselenggarakan pada <strong>8–12 Desember 2026</strong>. Ujian dilaksanakan secara tatap muka di ruang kelas masing-masing.</p>
      <p>Jadwal lengkap per mata pelajaran dapat dilihat pada halaman agenda portal ini dan papan pengumuman di koridor. Siswa diwajibkan hadir 15 menit sebelum waktu ujian dan membawa alat tulis serta penggaris.</p>
      <p>Bagi siswa yang berhalangan, surat keterangan dari orang tua wajib diserahkan kepada wali kelas paling lambat sehari sebelum ujian berlangsung.</p>`,
    thumbnail_url: img('children-working-together-at-school-4321352114.jpg'),
    category_id: 'c-pengumuman',
    author_id: 'u-admin',
    status: 'published',
    is_featured: true,
    views_count: 3214,
    published_at: '2026-11-20T07:45:00+07:00',
    created_at: '2026-11-20T07:00:00+07:00',
    updated_at: '2026-11-20T07:45:00+07:00',
  },
  {
    id: 'p-4',
    title: 'Kelas Tilawah Menjaga Hafalan Siswa',
    slug: 'kelas-tilawah-bersama',
    excerpt: 'Setiap Selasa sore, siswa dan guru berkumpul untuk tilawah bersama dan menyimak hafalan satu sama lain.',
    content: `<p>Di ruang perpustakaan kecil madrasah, setiap Selasa pukul 15.30 berlangsung kelas tilawah bersama. Kegiatan ini diikuti siswa dari kelas VII hingga XI dengan target hafalan yang berbeda-beda.</p>
      <p>Sesi dimulai dengan tilawah bersama selama dua puluh menit, dilanjutkan dengan penyimakan hafalan secara bergiliran. Guru BK dan guru agama bergantian menjadi pembimbing.</p>
      <blockquote>“Yang paling berharga bukan jumlah ayat yang dihafal, tapi konsistensi yang dibangun setiap minggu,” ujar Ustazah Halimah, pembimbing kegiatan.</blockquote>
      <p>Kelas ini terbuka bagi siswa baru. Pendaftaran bisa dilakukan melalui wali kelas masing-masing.</p>`,
    thumbnail_url: img('elementary-students-reciting-al-quran-in-school.jpg'),
    category_id: 'c-islami',
    author_id: 'u-writer-2',
    status: 'published',
    is_featured: false,
    views_count: 742,
    published_at: '2026-11-18T16:20:00+07:00',
    created_at: '2026-11-17T13:00:00+07:00',
    updated_at: '2026-11-18T16:20:00+07:00',
  },
  {
    id: 'p-5',
    title: 'Ekstrakurikuler Jurnalistik Melepaskan 12 Penulis Muda',
    slug: 'ekskul-jurnalistik-penulis-muda',
    excerpt: 'Dua belas siswa menyelesaikan pelatihan menulis berita dan kini menjadi kontributor tetap portal Madrasah Digital.',
    content: `<p>Ekstrakurikuler Jurnalistik Madrasah Digital menyelesaikan program pelatihan menulis berita selama delapan pertemuan. Dua belas siswa yang mengikuti program kini menjadi kontributor tetap portal berita Madrasah Digital.</p>
      <p>Materi pelatihan meliputi teknik wawancara, struktur berita piramida terbalik, penulisan judul, dan etika publikasi. Setiap peserta menghasilkan satu tulisan yang dieditori bersama pembina sebelum diunggah.</p>
      <p>Ke depan, ekskul ini akan menerbitkan rubrik opini siswa setiap dua minggu sekali dan membuka pendaftaran anggota baru setiap awal semester.</p>`,
    thumbnail_url: img('children-working-together-at-school-4321352114.jpg'),
    category_id: 'c-opini',
    author_id: 'u-writer-2',
    status: 'published',
    is_featured: false,
    views_count: 538,
    published_at: '2026-11-16T10:10:00+07:00',
    created_at: '2026-11-15T09:00:00+07:00',
    updated_at: '2026-11-16T10:10:00+07:00',
  },
  {
    id: 'p-6',
    title: 'Karya Daur Ulang Siswa Menang Lomba Kreativitas',
    slug: 'karya-daur-ulang-lomba-kreativitas',
    excerpt: 'Tim siswa mengubah barang bekas menjadi karya seni dan meraih juara kedua di festival sekolah se-kota.',
    content: `<p>Lima siswa Madrasah Digital meraih juara kedua dalam Festival Kreativitas Sekolah se-kota melalui karya seni berbahan barang daur ulang. Karya mereka berupa instalasi mini dari kertas bekas, botol plastik, dan potongan kayu.</p>
      <p>Proses pengerjaan memakan waktu tiga minggu. Siswa mengumpulkan material bekas dari rumah dan lingkungan sekolah, lalu menyusunnya menjadi komposisi yang menggambarkan kebersihan lingkungan.</p>
      <p>Prestasi ini sekaligus mendukung program madrasah ramah lingkungan yang diluncurkan tahun ajaran ini.</p>`,
    thumbnail_url: img('art-made-out-of-recycling-and-used.jpg'),
    category_id: 'c-prestasi',
    author_id: 'u-writer-1',
    status: 'published',
    is_featured: false,
    views_count: 1129,
    published_at: '2026-11-12T11:00:00+07:00',
    created_at: '2026-11-11T14:00:00+07:00',
    updated_at: '2026-11-12T11:00:00+07:00',
  },
  {
    id: 'p-7',
    title: 'Upacara Bendera Peringatan Hari Pahlawan',
    slug: 'upacara-hari-pahlawan-2026',
    excerpt: 'Seluruh warga madrasah mengikuti upacara dengan tema kepahlawanan dalam kehidupan sehari-hari.',
    content: `<p>Madrasah Digital menggelar upacara bendera khusus dalam rangka Peringatan Hari Pahlawan. Upacara dipimpin oleh Kepala Madrasah dan diikuti seluruh siswa, guru, serta tenaga kependidikan.</p>
      <p>Amanat pembina upacara mengajak siswa mengartikan kepahlawanan lewat hal sederhana: disiplin belajar, membantu teman, dan menjaga kebersihan lingkungan sekolah.</p>
      <p>Usai upacara, siswa kelas VIII melakukan ziarah ke taman makam pahlawan setempat bersama guru Pembina Pramuka.</p>`,
    thumbnail_url: img('upacara-bendera-flag-ceremony-at-smp-kartika.jpg'),
    category_id: 'c-kegiatan',
    author_id: 'u-writer-2',
    status: 'published',
    is_featured: false,
    views_count: 634,
    published_at: '2026-11-10T09:00:00+07:00',
    created_at: '2026-11-10T06:30:00+07:00',
    updated_at: '2026-11-10T09:00:00+07:00',
  },
  {
    id: 'p-8',
    title: 'Pendaftaran PPDB 2027/2028 Dibuka 15 Januari',
    slug: 'ppdb-2027-2028',
    excerpt: 'Kuota penerimaan 120 siswa. Pendaftaran online dan verifikasi berkas dilakukan dalam dua tahap.',
    content: `<p>Penerimaan Peserta Didik Baru Madrasah Digital Tahun Ajaran 2027/2028 dibuka mulai <strong>15 Januari 2027</strong>. Kuota yang tersedia sebanyak 120 siswa untuk kelas VII.</p>
      <p>Pendaftaran dilakukan secara online melalui portal Madrasah Digital. Calon siswa mengunggah Kartu Keluarga, akta kelahiran, dan rapor terakhir, lalu mengikuti verifikasi berkas di madrasah.</p>
      <p>Informasi lengkap mengenai jadwal dan persyaratan dapat dihubungi melalui kontak resmi madrasah.</p>`,
    thumbnail_url: img('flag-ceremony-at-school-in-indonesia.jpg'),
    category_id: 'c-pengumuman',
    author_id: 'u-admin',
    status: 'published',
    is_featured: false,
    views_count: 2761,
    published_at: '2026-11-05T13:15:00+07:00',
    created_at: '2026-11-05T10:00:00+07:00',
    updated_at: '2026-11-05T13:15:00+07:00',
  },
  {
    id: 'p-9',
    title: 'Catatan Seorang Siswa: Belajar dari Kegagalan Lomba',
    slug: 'belajar-dari-kegagalan-lomba',
    excerpt: 'Sebuah renungan jujur setelah kalah di babak final lomba pidato tingkat kota.',
    content: `<p>Awalnya saya mengira kalah itu berarti saya memang tidak cukup baik. Setelah berbicara dengan pembina, saya sadari bahwa penilaian juri juga soal penyampaian, bukan hanya hafalan teks.</p>
      <p>Lomba berikutnya mungkin masih ada. Yang pasti, saya sudah belajar satu hal yang tidak diajarkan di buku: kegagalan bisa menjadi catatan paling jujur tentang diri sendiri.</p>`,
    thumbnail_url: img('children-working-together-at-school-4321352114.jpg'),
    category_id: 'c-opini',
    author_id: 'u-writer-2',
    status: 'draft',
    is_featured: false,
    views_count: 0,
    published_at: null,
    created_at: '2026-11-25T15:00:00+07:00',
    updated_at: '2026-11-25T15:00:00+07:00',
  },
  {
    id: 'p-10',
    title: 'Adab Menuntut Ilmu Menurut Imam Syafi’i',
    slug: 'adab-menuntut-ilmu-imam-syafii',
    excerpt: 'Ringkasan hikmah tentang niat, ikhlas, dan cara menghormati guru dalam menuntut ilmu.',
    content: `<p>Imam Syafi’i Rahimahullah mengajarkan bahwa ilmu tidak hanya diperoleh dengan membaca, tetapi juga dengan adab. Niat yang ikhlas menjadi pondasi sebelum seseorang mulai belajar.</p>
      <p>Di antara adab yang diajarkan adalah menghormati guru, tidak merasa lebih tahu, dan mengamalkan ilmu yang sudah dipahami.</p>
      <blockquote>“Ilmu itu cahaya, tetapi cahaya itu hanya akan sampai kepada hati yang bersih.”</blockquote>`,
    thumbnail_url: img('elementary-students-reciting-al-quran-in-school.jpg'),
    category_id: 'c-islami',
    author_id: 'u-writer-1',
    status: 'pending',
    is_featured: false,
    views_count: 0,
    published_at: null,
    created_at: '2026-11-26T08:00:00+07:00',
    updated_at: '2026-11-26T08:00:00+07:00',
  },
]

export const demoAgendas = [
  { id: 'a-1', title: 'Ujian Tengah Semester Ganjil', event_date: '2026-12-08', location: 'Ruang kelas masing-masing', description: 'Berlaku untuk kelas VII–XI. Jadwal per mapel diumumkan wali kelas.' },
  { id: 'a-2', title: 'Kelas Tilawah Bersama', event_date: '2026-12-01', location: 'Perpustakaan madrasah', description: 'Pukul 15.30 WIB. Terbuka untuk seluruh siswa.' },
  { id: 'a-3', title: 'Rapat Dewan Guru Bulanan', event_date: '2026-12-05', location: 'Ruang rapat', description: 'Evaluasi kegiatan bulan November dan persiapan ujian.' },
  { id: 'a-4', title: 'Pendaftaran PPDB 2027/2028', event_date: '2027-01-15', location: 'Online', description: 'Pendaftaran dibuka melalui tautan resmi PPDB madrasah.' },
  { id: 'a-5', title: 'Libur Idul Fitri', event_date: '2027-03-09', location: 'Seluruh madrasah', description: 'Madrasah libur dan dilanjutkan kembali setelah cuti bersama.' },
  { id: 'a-6', title: 'Pelatihan Literasi Digital untuk Guru', event_date: '2026-12-12', location: 'Laboratorium komputer', description: 'Pengenalan CMS, keamanan akun, dan pengelolaan konten portal Madrasah Digital.' },
]

export const demoGallery = [
  { id: 'g-1', title: 'Kuis Rangking Satu', image_url: img('kegiatan-rangking-1-di-madrasah-tsanawiyah-negeri.jpg'), caption: 'Siswa mengikuti kuis akademik', taken_at: '2026-10-12' },
  { id: 'g-2', title: 'Karya Daur Ulang', image_url: img('art-made-out-of-recycling-and-used.jpg'), caption: 'Pameran karya siswa', taken_at: '2026-10-18' },
  { id: 'g-3', title: 'Diskusi Kelompok', image_url: img('children-working-together-at-school-4321352114.jpg'), caption: 'Sesi belajar bersama', taken_at: '2026-09-28' },
  { id: 'g-4', title: 'Tilawah Bersama', image_url: img('elementary-students-reciting-al-quran-in-school.jpg'), caption: 'Halaqah tilawah siswa', taken_at: '2026-10-02' },
  { id: 'g-5', title: 'Upacara Mingguan', image_url: img('flag-ceremony-at-school-in-indonesia.jpg'), caption: 'Upacara bendera mingguan', taken_at: '2026-09-14' },
  { id: 'g-6', title: 'Kegiatan Kelas', image_url: img('decentralized-basic-education-in-indonesia.jpg'), caption: 'Aktivitas belajar di kelas', taken_at: '2026-09-20' },
  { id: 'g-7', title: 'Upacara Hari Pahlawan', image_url: img('upacara-bendera-flag-ceremony-at-smp-kartika.jpg'), caption: 'Barisan siswa saat upacara', taken_at: '2026-11-10' },
  { id: 'g-8', title: 'Pameran Kreativitas', image_url: img('art-made-out-of-recycling-and-used.jpg'), caption: 'Detail instalasi karya siswa', taken_at: '2026-10-18' },
  { id: 'g-9', title: 'Lomba Akademik', image_url: img('kegiatan-rangking-1-di-madrasah-tsanawiyah-negeri.jpg'), caption: 'Sesi final kuis akademik', taken_at: '2026-10-12' },
  { id: 'g-10', title: 'Belajar Bersama', image_url: img('children-working-together-at-school-4321352114.jpg'), caption: 'Siswa berdiskusi', taken_at: '2026-09-28' },
  { id: 'g-11', title: 'Mushaf di Perpustakaan', image_url: img('elementary-students-reciting-al-quran-in-school.jpg'), caption: 'Kegiatan membaca Al-Qur’an', taken_at: '2026-10-02' },
  { id: 'g-12', title: 'Barisan Upacara', image_url: img('upacara-bendera-flag-ceremony-at-smp-kartika.jpg'), caption: 'Upacara bendera mingguan', taken_at: '2026-09-14' },
]

export const demoSettings = {
  id: 1,
  madrasah_name: 'Madrasah Digital',
  tagline: 'Informasi madrasah, langkah digital.',
  welcome_title: 'Sambutan Kepala Madrasah',
  welcome_message: 'Assalamu’alaikum warahmatullahi wabarakatuh. Selamat datang di portal informasi Madrasah Digital. Di sini keluarga madrasah dapat mengikuti kegiatan, prestasi, pengumuman, dan perkembangan digitalisasi madrasah. Semua tulisan disusun oleh guru dan siswa kami, lalu ditinjau sebelum terbit.',
  headmaster_name: 'H. Abdurrahman, M.Pd.',
  address: 'Jl. Cendekia No. 12, Kelurahan Sukamaju, Kota Bandung',
  email: 'info@madrasahdigital.sch.id',
  phone: '(022) 1234 5678',
  ppdb_url: 'https://ppdb.madrasahdigital.sch.id',
  facebook_url: '',
  instagram_url: '',
}
