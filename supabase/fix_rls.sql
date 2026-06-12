-- Fix RLS: disable untuk semua tabel POS
-- Jalankan di: https://supabase.com/dashboard/project/ddgipbesoktmowbnpvxu/sql/new

alter table public.products        disable row level security;
alter table public.categories      disable row level security;
alter table public.payment_methods disable row level security;
alter table public.orders          disable row level security;
alter table public.order_items     disable row level security;
