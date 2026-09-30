
Configuracion SupaBase

```bash
cp .env.example .env
# pega tu URL y anon key en .env
npm install
npm run dev
```
Las imágenes (`img/*`) ya están copiadas a `public/img/`, así que las rutas
`/img/rtx3080.jpg`, etc. funcionan igual que en el sitio original.

## 3. Crear el primer usuario Administrador

Por seguridad, RLS exige que quien crea/edita productos o usuarios ya tenga un
perfil con `tipo = 'Administrador'` o `'Vendedor'`. Para crear el primero:

1. Regístrate normalmente desde `/registro` (quedará como `Cliente`).
2. En el **SQL Editor** de Supabase, ejecuta:
   ```sql
   update public.perfiles set tipo = 'Administrador' where correo = 'tu-correo@duoc.cl';
   ```
3. Vuelve a iniciar sesión: ahora verás el enlace **Admin** en la navbar.

> Nota: Supabase Auth pide confirmar el correo por defecto. Para el
> desarrollo/entrega del ramo, puedes desactivarlo en
> **Authentication → Providers → Email → "Confirm email"** (déjalo apagado),
> así el registro entra directo sin revisar la bandeja de entrada.

## 4. Crear usuarios desde el panel admin (Edge Function)

El botón **"Nuevo Usuario"** del panel admin crea una cuenta de Auth para
*otra* persona. Eso requiere la `service_role key`, que **nunca** debe estar
en el navegador — por eso se resuelve con una Edge Function:

```bash
npm install -g supabase        # si no tienes la CLI
supabase login
supabase link --project-ref TU-PROJECT-REF
supabase functions deploy create-user
```

Sin este paso, el mantenedor de **Usuarios** sigue funcionando para **editar**
y **eliminar** perfiles existentes; solo la creación de cuentas nuevas desde el
panel necesita la función desplegada (el usuario final siempre puede crear su
propia cuenta desde `/registro`).

## 5. Decisiones de diseño a destacar (útiles para tu defensa)

- **Autenticación real**: las contraseñas ya no se guardan en texto plano en
  el navegador; las gestiona Supabase Auth (hash + salt).
- **Carrito híbrido**: si hay sesión, el carrito se guarda en `carrito_items`
  (persiste entre dispositivos); si es invitado, vive solo en memoria durante
  la visita — ya no se puede "editar" el carrito de otra persona modificando
  el localStorage del navegador.
- **RLS en vez de validar el rol solo en JS**: en la versión original,
  cualquiera podía abrir la consola y llamar `guardarProductos(...)`
  directamente. Ahora la base de datos rechaza la escritura si el usuario no
  es `Administrador`/`Vendedor`, sin importar qué código corra en el cliente.
- **Reseñas normalizadas**: en vez de un array `resenas` embebido dentro de
  cada producto, es una tabla `resenas` con clave foránea a `productos`
  (mejor para consultas y para tu curso de bases de datos).

## Estructura del proyecto

```
src/
  lib/            supabaseClient.js, validaciones.js (RUN chileno, dominios de correo, CLP)
  data/           regionesYComunas.js
  context/        AuthContext.jsx, CartContext.jsx
  components/     Navbar, Footer, ProductCard, ProtectedRoute
  pages/          Home, Productos, DetalleProducto, Carrito, Contacto, Nosotros,
                   Blogs, BlogDetalle, Registro, InicioSesion
  pages/Admin/    AdminLayout, AdminProductos, AdminUsuarios
supabase/
  schema.sql, seed_productos.sql, seed_blogs.sql
  functions/create-user/index.ts
```
