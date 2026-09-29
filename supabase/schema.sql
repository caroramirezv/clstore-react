-- =========================================================
-- CLstore — Esquema de Supabase (PostgreSQL)
-- Reemplaza el uso de localStorage por tablas reales + RLS.
-- Ejecutar en el SQL Editor de tu proyecto Supabase, en orden.
-- =========================================================

-- ---------------------------------------------------------
-- 1. PERFILES  (datos de negocio ligados a auth.users)
-- ---------------------------------------------------------
-- Supabase Auth ya guarda correo + contraseña (hasheada) en auth.users.
-- Aquí solo guardamos lo específico de CLstore: run, tipo, región, etc.
create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  run text unique not null,
  nombre text not null,
  apellidos text not null,
  correo text not null,
  fecha_nacimiento date,
  tipo text not null default 'Cliente' check (tipo in ('Administrador', 'Vendedor', 'Cliente')),
  region text not null,
  comuna text not null,
  direccion text not null,
  created_at timestamptz not null default now()
);

alter table public.perfiles enable row level security;

-- Cualquier usuario autenticado puede leer los perfiles (se necesita para
-- mostrar nombre/tipo en la navbar y para el mantenedor de usuarios del admin).
create policy "perfiles_select_autenticados"
  on public.perfiles for select
  to authenticated
  using (true);

-- Un usuario puede insertar SU PROPIO perfil (paso final del registro).
create policy "perfiles_insert_propio"
  on public.perfiles for insert
  to authenticated
  with check (auth.uid() = id);

-- Un usuario puede editar su propio perfil; Administrador/Vendedor puede editar cualquiera.
create policy "perfiles_update_propio_o_admin"
  on public.perfiles for update
  to authenticated
  using (
    auth.uid() = id
    or exists (select 1 from public.perfiles p where p.id = auth.uid() and p.tipo in ('Administrador', 'Vendedor'))
  );

-- Solo Administrador/Vendedor puede eliminar perfiles (usuarios) desde el panel admin.
create policy "perfiles_delete_admin"
  on public.perfiles for delete
  to authenticated
  using (
    exists (select 1 from public.perfiles p where p.id = auth.uid() and p.tipo in ('Administrador', 'Vendedor'))
  );

-- ---------------------------------------------------------
-- 2. PRODUCTOS
-- ---------------------------------------------------------
create table public.productos (
  id text primary key,
  nombre text not null,
  descripcion text,
  precio numeric not null check (precio >= 0),
  stock integer not null default 0 check (stock >= 0),
  stock_critico integer,
  categoria text not null check (categoria in ('componentes', 'consolas', 'perifericos')),
  imagen text,
  imagenes text[],
  busqueda text,
  destacado jsonb,
  especificaciones jsonb,
  created_at timestamptz not null default now()
);

alter table public.productos enable row level security;

-- Catálogo público: cualquiera (incluso sin sesión) puede leer productos.
create policy "productos_select_publico"
  on public.productos for select
  to anon, authenticated
  using (true);

-- Solo Administrador/Vendedor puede crear/editar/eliminar productos.
create policy "productos_insert_admin"
  on public.productos for insert
  to authenticated
  with check (
    exists (select 1 from public.perfiles p where p.id = auth.uid() and p.tipo in ('Administrador', 'Vendedor'))
  );

create policy "productos_update_admin"
  on public.productos for update
  to authenticated
  using (
    exists (select 1 from public.perfiles p where p.id = auth.uid() and p.tipo in ('Administrador', 'Vendedor'))
  );

create policy "productos_delete_admin"
  on public.productos for delete
  to authenticated
  using (
    exists (select 1 from public.perfiles p where p.id = auth.uid() and p.tipo in ('Administrador', 'Vendedor'))
  );

-- ---------------------------------------------------------
-- 3. RESEÑAS  (normalizadas, en vez del array "resenas" embebido)
-- ---------------------------------------------------------
create table public.resenas (
  id bigserial primary key,
  producto_id text not null references public.productos (id) on delete cascade,
  usuario text not null,
  calificacion integer not null check (calificacion between 1 and 5),
  comentario text not null,
  fecha date not null default current_date
);

alter table public.resenas enable row level security;

create policy "resenas_select_publico"
  on public.resenas for select
  to anon, authenticated
  using (true);

create policy "resenas_insert_autenticados"
  on public.resenas for insert
  to authenticated
  with check (true);

-- ---------------------------------------------------------
-- 4. BLOGS
-- ---------------------------------------------------------
create table public.blogs (
  id text primary key,
  titulo text not null,
  resumen text,
  imagen text,
  contenido text[] not null default '{}',
  fuente_nombre text,
  fuente_url text,
  created_at timestamptz not null default now()
);

alter table public.blogs enable row level security;

create policy "blogs_select_publico"
  on public.blogs for select
  to anon, authenticated
  using (true);

create policy "blogs_write_admin"
  on public.blogs for all
  to authenticated
  using (
    exists (select 1 from public.perfiles p where p.id = auth.uid() and p.tipo in ('Administrador', 'Vendedor'))
  );

-- ---------------------------------------------------------
-- 5. CARRITO_ITEMS  (reemplaza localStorage("carrito") para usuarios logueados)
-- ---------------------------------------------------------
create table public.carrito_items (
  id bigserial primary key,
  usuario_id uuid not null references auth.users (id) on delete cascade,
  producto_id text not null references public.productos (id) on delete cascade,
  cantidad integer not null check (cantidad > 0),
  created_at timestamptz not null default now(),
  unique (usuario_id, producto_id)
);

alter table public.carrito_items enable row level security;

-- Cada usuario solo puede ver/modificar su propio carrito.
create policy "carrito_select_propio"
  on public.carrito_items for select
  to authenticated
  using (auth.uid() = usuario_id);

create policy "carrito_insert_propio"
  on public.carrito_items for insert
  to authenticated
  with check (auth.uid() = usuario_id);

create policy "carrito_update_propio"
  on public.carrito_items for update
  to authenticated
  using (auth.uid() = usuario_id);

create policy "carrito_delete_propio"
  on public.carrito_items for delete
  to authenticated
  using (auth.uid() = usuario_id);

-- ---------------------------------------------------------
-- 6. CONTACTOS  (reemplaza localStorage("contactos_clstore"))
-- ---------------------------------------------------------
create table public.contactos (
  id bigserial primary key,
  nombre text not null,
  email text not null,
  mensaje text not null,
  creado_en timestamptz not null default now()
);

alter table public.contactos enable row level security;

-- Cualquiera (incluso sin sesión) puede ENVIAR un mensaje de contacto...
create policy "contactos_insert_publico"
  on public.contactos for insert
  to anon, authenticated
  with check (true);

-- ...pero solo Administrador/Vendedor puede LEER los mensajes recibidos.
create policy "contactos_select_admin"
  on public.contactos for select
  to authenticated
  using (
    exists (select 1 from public.perfiles p where p.id = auth.uid() and p.tipo in ('Administrador', 'Vendedor'))
  );

-- ---------------------------------------------------------
-- 7. Índices útiles
-- ---------------------------------------------------------
create index idx_productos_categoria on public.productos (categoria);
create index idx_resenas_producto on public.resenas (producto_id);
create index idx_carrito_usuario on public.carrito_items (usuario_id);
