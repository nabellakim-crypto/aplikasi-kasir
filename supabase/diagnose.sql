-- Jalankan ini di Supabase SQL Editor untuk diagnosa
-- https://supabase.com/dashboard/project/ddgipbesoktmowbnpvxu/sql/new

-- 1. Cek kolom apa saja yang ada di tabel products
select column_name, data_type, column_default, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'products'
order by ordinal_position;

-- 2. Cek 3 baris pertama (tanpa filter apapun)
select * from public.products limit 3;

-- 3. Cek nilai is_active
select id, name, is_active from public.products limit 5;
