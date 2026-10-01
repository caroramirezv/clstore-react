// supabase/functions/create-user/index.ts
//
// El cliente (navegador) nunca debe tener la service_role key: por eso crear
// una cuenta de Auth "a nombre de otra persona" (como hace el botón
// "Nuevo Usuario" del panel admin) se hace aquí, en una Edge Function que
// corre en el servidor de Supabase con esa clave.
//
// Despliegue (una sola vez, con la Supabase CLI):
//   supabase functions deploy create-user
//
// La función ya tiene acceso automático a SUPABASE_URL y
// SUPABASE_SERVICE_ROLE_KEY como variables de entorno (las inyecta Supabase).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');

    // Cliente "normal" (anon) solo para validar quién está llamando.
    const supabaseAnon = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY'), {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: errorUsuario } = await supabaseAnon.auth.getUser(token);
    if (errorUsuario || !user) {
      return new Response(JSON.stringify({ error: 'No autenticado.' }), { status: 401 });
    }

    // Cliente con privilegios de servicio, para verificar el rol y crear al nuevo usuario.
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: perfilLlamador } = await supabaseAdmin
      .from('perfiles')
      .select('tipo')
      .eq('id', user.id)
      .single();

    if (!perfilLlamador || !['Administrador', 'Vendedor'].includes(perfilLlamador.tipo)) {
      return new Response(JSON.stringify({ error: 'No tienes permisos para crear usuarios.' }), { status: 403 });
    }

    const body = await req.json();
    const { run, tipo, nombre, apellidos, correo, fechaNacimiento, password, region, comuna, direccion } = body;

    const { data: nuevoUsuario, error: errorCreacion } = await supabaseAdmin.auth.admin.createUser({
      email: correo,
      password,
      email_confirm: true, // se salta la confirmación por correo: lo crea un administrador
    });
    if (errorCreacion) {
      return new Response(JSON.stringify({ error: errorCreacion.message }), { status: 400 });
    }

    const { error: errorPerfil } = await supabaseAdmin.from('perfiles').insert({
      id: nuevoUsuario.user.id,
      run,
      tipo,
      nombre,
      apellidos,
      correo,
      fecha_nacimiento: fechaNacimiento || null,
      region,
      comuna,
      direccion,
    });
    if (errorPerfil) {
      // Si falla la creación del perfil, deshacemos la cuenta de Auth para no dejar usuarios huérfanos.
      await supabaseAdmin.auth.admin.deleteUser(nuevoUsuario.user.id);
      return new Response(JSON.stringify({ error: errorPerfil.message }), { status: 400 });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
