-- ============================================================================
-- Portal Berita Madrasah — skema lengkap Supabase PostgreSQL
-- Jalankan seluruh file ini di Supabase Dashboard → SQL Editor → New query → Run
-- Aman dijalankan ulang (idempotent).
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- 1. Tabel
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  role text check (role in ('admin', 'writer')) default 'writer',
  avatar_url text,
  bio text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz default now()
);

create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null default '',
  thumbnail_url text,
  category_id uuid references public.categories(id) on delete set null,
  author_id uuid references public.profiles(id) on delete cascade,
  status text check (status in ('draft', 'pending', 'published')) default 'draft',
  is_featured boolean default false,
  views_count int default 0,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.agendas (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  event_date date not null,
  location text,
  description text,
  created_at timestamptz default now()
);

-- Tambahan: galeri foto kegiatan (sesuai kebutuhan fungsional pengunjung)
create table if not exists public.gallery_photos (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  image_url text not null,
  caption text,
  taken_at date,
  created_at timestamptz default now()
);

-- Tambahan: profil madrasah, sambutan kepala madrasah, kontak, link PPDB
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  madrasah_name text not null default 'Madrasah Al-Hikmah',
  tagline text,
  welcome_title text,
  welcome_message text,
  headmaster_name text,
  address text,
  email text,
  phone text,
  ppdb_url text,
  facebook_url text,
  instagram_url text,
  updated_at timestamptz default now()
);

create index if not exists posts_status_published_idx on public.posts (status, published_at desc);
create index if not exists posts_category_idx on public.posts (category_id);
create index if not exists posts_author_idx on public.posts (author_id);
create index if not exists agendas_date_idx on public.agendas (event_date);

-- ---------------------------------------------------------------------------
-- 2. Fungsi pembantu & trigger
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin' and p.is_active = true
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, avatar_url)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1)),
    coalesce(nullif(new.raw_user_meta_data->>'role', ''), 'writer'),
    nullif(new.raw_user_meta_data->>'avatar_url', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.post_timestamps()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  if new.status = 'published' and old.status <> 'published' then
    new.published_at := coalesce(new.published_at, now());
  end if;
  return new;
end;
$$;

drop trigger if exists set_post_timestamps on public.posts;
create trigger set_post_timestamps
  before update on public.posts
  for each row execute function public.post_timestamps();

-- Penulis tidak boleh mengubah role/status akun sendiri lewat update profil
create or replace function public.guard_profile_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (new.role is distinct from old.role or new.is_active is distinct from old.is_active)
     and not public.is_admin() then
    raise exception 'Hanya admin yang dapat mengubah role atau status akun';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_profile_changes on public.profiles;
create trigger guard_profile_changes
  before update on public.profiles
  for each row execute function public.guard_profile_changes();

-- Counter pembaca dipanggil dari halaman detail berita
create or replace function public.increment_post_views(p_post_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.posts
     set views_count = coalesce(views_count, 0) + 1
   where id = p_post_id and status = 'published';
$$;

grant execute on function public.increment_post_views(uuid) to anon, authenticated;

-- View publik untuk nama penulis (tanpa membuka kolom role/email profil)
create or replace view public.public_authors as
  select p.id, p.full_name, p.avatar_url, p.bio
  from public.profiles p
  where p.is_active = true;

grant select on public.public_authors to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.posts enable row level security;
alter table public.agendas enable row level security;
alter table public.gallery_photos enable row level security;
alter table public.site_settings enable row level security;

-- profiles
drop policy if exists "Profil own + admin" on public.profiles;
create policy "Profil own + admin" on public.profiles
  for select to authenticated
  using (auth.uid() = id or public.is_admin());

drop policy if exists "User buat profil sendiri" on public.profiles;
create policy "User buat profil sendiri" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

drop policy if exists "User ubah profil sendiri, admin ubah semua" on public.profiles;
create policy "User ubah profil sendiri, admin ubah semua" on public.profiles
  for update to authenticated
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

drop policy if exists "Hanya admin hapus profil" on public.profiles;
create policy "Hanya admin hapus profil" on public.profiles
  for delete to authenticated using (public.is_admin());

-- categories
drop policy if exists "Kategori bisa dibaca semua" on public.categories;
create policy "Kategori bisa dibaca semua" on public.categories
  for select using (true);

drop policy if exists "Hanya admin kelola kategori" on public.categories;
create policy "Hanya admin kelola kategori" on public.categories
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- posts
drop policy if exists "Publik baca berita terbit" on public.posts;
create policy "Publik baca berita terbit" on public.posts
  for select
  using (status = 'published' or auth.uid() = author_id or public.is_admin());

drop policy if exists "Penulis buat berita sendiri" on public.posts;
create policy "Penulis buat berita sendiri" on public.posts
  for insert to authenticated
  with check (
    auth.uid() = author_id
    and (public.is_admin() or status in ('draft', 'pending'))
  );

drop policy if exists "Penulis ubah draf sendiri, admin ubah semua" on public.posts;
create policy "Penulis ubah draf sendiri, admin ubah semua" on public.posts
  for update to authenticated
  using (public.is_admin() or (auth.uid() = author_id and status in ('draft', 'pending')))
  with check (public.is_admin() or (auth.uid() = author_id and status in ('draft', 'pending')));

drop policy if exists "Hanya admin hapus berita" on public.posts;
create policy "Hanya admin hapus berita" on public.posts
  for delete to authenticated using (public.is_admin());

-- agendas
drop policy if exists "Agenda bisa dibaca semua" on public.agendas;
create policy "Agenda bisa dibaca semua" on public.agendas for select using (true);

drop policy if exists "Hanya admin kelola agenda" on public.agendas;
create policy "Hanya admin kelola agenda" on public.agendas
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- gallery_photos
drop policy if exists "Galeri bisa dibaca semua" on public.gallery_photos;
create policy "Galeri bisa dibaca semua" on public.gallery_photos for select using (true);

drop policy if exists "Hanya admin kelola galeri" on public.gallery_photos;
create policy "Hanya admin kelola galeri" on public.gallery_photos
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- site_settings
drop policy if exists "Pengaturan bisa dibaca semua" on public.site_settings;
create policy "Pengaturan bisa dibaca semua" on public.site_settings for select using (true);

drop policy if exists "Hanya admin ubah pengaturan" on public.site_settings;
create policy "Hanya admin ubah pengaturan" on public.site_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 4. Storage bucket news-images
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'news-images', 'news-images', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Gambar berita bisa dilihat semua" on storage.objects;
create policy "Gambar berita bisa dilihat semua" on storage.objects
  for select using (bucket_id = 'news-images');

drop policy if exists "User upload ke folder sendiri" on storage.objects;
create policy "User upload ke folder sendiri" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'news-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "User hapus gambar sendiri" on storage.objects;
create policy "User hapus gambar sendiri" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'news-images'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

drop policy if exists "User ubah gambar sendiri" on storage.objects;
create policy "User ubah gambar sendiri" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'news-images'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

-- ---------------------------------------------------------------------------
-- 5. Data awal
-- ---------------------------------------------------------------------------

insert into public.categories (name, slug, description) values
  ('Kegiatan', 'kegiatan', 'Kegiatan belajar mengajar dan ekstrakurikuler madrasah'),
  ('Prestasi', 'prestasi', 'Prestasi siswa dan guru di bidang akademik maupun non-akademik'),
  ('Pengumuman', 'pengumuman', 'Pengumuman resmi untuk warga madrasah dan orang tua'),
  ('Opini Siswa', 'opini-siswa', 'Tulisan dan sudut pandang siswa'),
  ('Artikel Islami', 'artikel-islami', 'Artikel keagamaan, tilawah, dan hikmah harian')
on conflict (slug) do nothing;

insert into public.site_settings (
  id, madrasah_name, tagline, welcome_title, welcome_message,
  headmaster_name, address, email, phone, ppdb_url, facebook_url, instagram_url
) values (
  1,
  'Madrasah Al-Hikmah',
  'Belajar, beramal, dan berkarya.',
  'Sambutan Kepala Madrasah',
  'Assalamu''alaikum warahmatullahi wabarakatuh. Selamat datang di portal informasi Madrasah Al-Hikmah. Di sini keluarga madrasah dapat mengikuti kegiatan, prestasi, dan pengumuman terkini. Semua tulisan disusun oleh guru dan siswa kami sendiri.',
  'H. Abdurrahman, M.Pd.',
  'Jl. Cendekia No. 12, Kelurahan Sukamaju, Kota Bandung',
  'info@alhikmah.sch.id',
  '(022) 1234 5678',
  'https://ppdb.alhikmah.sch.id',
  '',
  ''
)
on conflict (id) do nothing;

notify pgrst, 'reload schema';

-- ============================================================================
-- CATATAN PENTING
-- 1. Buat akun admin di Supabase → Authentication → Add user (email + password),
--    lalu centang Auto Confirm. Setelah akun dibuat, jalankan:
--      update public.profiles set role = 'admin'
--      where id = (select id from auth.users where email = 'admin@alhikmah.sch.id');
-- 2. Akun guru/siswa yang dibuat lewat Add user otomatis menjadi writer.
-- 3. Authentication → URL Configuration: isi Site URL dan Redirect URLs dengan
--    domain cPanel, mis. https://berita.madrasah.sch.id/**
-- ============================================================================
