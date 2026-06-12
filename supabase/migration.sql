-- ============================================================
-- NovaPOS — Supabase Migration
-- Run this entire file in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. CATEGORIES
create table if not exists public.categories (
  id         text primary key,
  label      text        not null,
  emoji      text        not null,
  sort_order integer     not null default 0
);

-- 2. PRODUCTS
create table if not exists public.products (
  id          serial primary key,
  name        text           not null,
  description text           not null default '',
  price       numeric(10, 2) not null,
  stock       integer        not null default 0,
  category_id text           not null references public.categories(id),
  image       text           not null default '',
  is_active   boolean        not null default true,
  created_at  timestamptz    not null default now(),
  updated_at  timestamptz    not null default now()
);

-- 3. PAYMENT METHODS
create table if not exists public.payment_methods (
  id         text primary key,   -- 'cash' | 'qris' | 'card'
  label      text    not null,
  sub_label  text    not null default '',
  icon_name  text    not null default '',
  is_active  boolean not null default true,
  sort_order integer not null default 0
);

-- 4. ORDERS (header)
create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  order_number     text        not null unique,
  status           text        not null default 'completed', -- completed | voided
  subtotal         numeric(10,2) not null,
  discount_amount  numeric(10,2) not null default 0,
  discount_type    text        not null default 'percent',   -- percent | fixed
  discount_value   numeric(10,2) not null default 0,
  tax_amount       numeric(10,2) not null,
  grand_total      numeric(10,2) not null,
  payment_method   text        not null references public.payment_methods(id),
  cash_received    numeric(10,2),
  change_amount    numeric(10,2),
  cashier_name     text        not null default 'Alex Morgan',
  notes            text,
  created_at       timestamptz not null default now()
);

-- 5. ORDER ITEMS (detail)
create table if not exists public.order_items (
  id           serial primary key,
  order_id     uuid           not null references public.orders(id) on delete cascade,
  product_id   integer        not null references public.products(id),
  product_name text           not null,   -- snapshot at time of sale
  unit_price   numeric(10,2)  not null,
  quantity     integer        not null,
  subtotal     numeric(10,2)  not null
);

-- ── Indexes ──────────────────────────────────────────────────
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists order_items_order_id_idx on public.order_items(order_id);

-- ── Auto-update updated_at on products ───────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ── RLS: disable for now (enable later when auth is added) ───
alter table public.categories      disable row level security;
alter table public.products        disable row level security;
alter table public.payment_methods disable row level security;
alter table public.orders          disable row level security;
alter table public.order_items     disable row level security;

-- ── Seed: categories ─────────────────────────────────────────
insert into public.categories (id, label, emoji, sort_order) values
  ('all',       'All Items',  '🏪', 0),
  ('beverages', 'Beverages',  '☕', 1),
  ('food',      'Food',       '🍔', 2),
  ('snacks',    'Snacks',     '🍿', 3),
  ('dairy',     'Dairy',      '🥛', 4),
  ('bakery',    'Bakery',     '🥐', 5),
  ('produce',   'Produce',    '🥦', 6)
on conflict (id) do nothing;

-- ── Seed: payment methods ─────────────────────────────────────
insert into public.payment_methods (id, label, sub_label, icon_name, is_active, sort_order) values
  ('cash', 'Cash',        'Count & change', 'Banknote',   true, 0),
  ('qris', 'QRIS',        'Scan QR code',   'QrCode',     true, 1),
  ('card', 'Card',        'Credit / Debit', 'CreditCard', true, 2)
on conflict (id) do nothing;

-- ── Seed: products ────────────────────────────────────────────
insert into public.products (name, description, price, stock, category_id, image) values
  ('Caramel Latte',          'Rich espresso with caramel syrup and steamed milk',         5.50, 24, 'beverages', 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&q=80'),
  ('Matcha Green Tea',       'Premium Japanese matcha blended with oat milk',             4.75, 18, 'beverages', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80'),
  ('Freshly Brewed Coffee',  'House blend drip coffee, served hot',                       3.25, 40, 'beverages', 'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=400&q=80'),
  ('Mango Smoothie',         'Fresh mango blended with yogurt and honey',                 6.00,  3, 'beverages', 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&q=80'),
  ('Smash Burger',           'Double smash patty with cheese and special sauce',         11.50, 15, 'food',      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80'),
  ('Grilled Chicken Wrap',   'Grilled chicken with fresh veggies in a warm tortilla',     9.00, 10, 'food',      'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=80'),
  ('Margherita Pizza Slice', 'Classic margherita with fresh basil and mozzarella',        7.25,  8, 'food',      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80'),
  ('Caesar Salad',           'Romaine lettuce, croutons, parmesan and caesar dressing',   8.50, 12, 'food',      'https://images.unsplash.com/photo-1512852939750-1305098529bf?w=400&q=80'),
  ('Salted Pretzels',        'Crunchy salted pretzels, 80g bag',                          2.50, 55, 'snacks',    'https://images.unsplash.com/photo-1508896694512-1eade558679c?w=400&q=80'),
  ('Kettle Chips',           'Sea salt kettle-cooked potato chips',                       3.00, 30, 'snacks',    'https://images.unsplash.com/photo-1621447088424-a5d1e0b43b84?w=400&q=80'),
  ('Chocolate Bar',          '70% dark chocolate, 50g',                                   2.00, 60, 'snacks',    'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&q=80'),
  ('Trail Mix Bag',          'Mixed nuts, dried fruits, and seeds',                       4.25, 22, 'snacks',    'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=400&q=80'),
  ('Whole Milk (1L)',         'Full-cream fresh milk, 1 liter',                            2.80, 20, 'dairy',     'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80'),
  ('Greek Yogurt Cup',       'Plain Greek yogurt, high protein, 200g',                    3.50, 16, 'dairy',     'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80'),
  ('Cheddar Cheese Slice',   'Aged cheddar sliced, 150g pack',                            4.00,  0, 'dairy',     'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=80'),
  ('Butter Croissant',       'Flaky French-style butter croissant',                       3.75,  7, 'bakery',    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80'),
  ('Sourdough Loaf',         'Artisan sourdough, freshly baked daily',                    6.50,  5, 'bakery',    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80'),
  ('Blueberry Muffin',       'Moist muffin loaded with fresh blueberries',                2.75, 14, 'bakery',    'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&q=80'),
  ('Baby Spinach (200g)',    'Fresh organic baby spinach leaves',                         3.20,  9, 'produce',   'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80'),
  ('Avocado (each)',          'Ripe Hass avocado, ready to eat',                           1.50, 25, 'produce',   'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&q=80')
on conflict do nothing;

-- ── RPC: decrement stock safely (won't go below 0) ───────────
create or replace function public.decrement_stock(p_product_id integer, p_qty integer)
returns void language plpgsql as $$
begin
  update public.products
  set stock = greatest(0, stock - p_qty)
  where id = p_product_id;
end;
$$;
