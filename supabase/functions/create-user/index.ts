declare const Deno: {
  env: {
    get: (key: string) => string | undefined;
  };
  serve: (handler: (req: Request) => Promise<Response> | Response) => void;
};

// @ts-expect-error Deno resuelve este módulo remoto en tiempo de ejecución.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// El navegador manda una petición OPTIONS (preflight) antes del POST porque
// la llamada incluye el header "Authorization". Sin estas cabeceras, ese
// preflight falla y supabase-js nunca llega a hacer la petición real — de
// ahí el "Failed to send a request to the Edge Function".
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  // Responder el preflight ANTES que cualquier otra cosa.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');

    // Cliente "normal" (anon) solo para validar quién está llamando.
    const supabaseAnon = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY'), {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: errorUsuario } = await supabaseAnon.auth.getUser(token);
    if (errorUsuario || !user) {
      return jsonResponse({ error: 'No autenticado.' }, 401);
    }

    // Cliente con privilegios de servicio, para verificar el rol y crear al nuevo usuario.
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: perfilLlamador } = await supabaseAdmin
      .from('perfiles')
      .select('tipo')
      .eq('id', user.id)
      .single();

    if (!perfilLlamador || !['Administrador', 'Vendedor'].includes(perfilLlamador.tipo)) {
      return jsonResponse({ error: 'No tienes permisos para crear usuarios.' }, 403);
    }

    const body = await req.json();
    const { run, tipo, nombre, apellidos, correo, fechaNacimiento, password, region, comuna, direccion } = body;

    const { data: nuevoUsuario, error: errorCreacion } = await supabaseAdmin.auth.admin.createUser({
      email: correo,
      password,
      email_confirm: true, // se salta la confirmación por correo: lo crea un administrador
    });
    if (errorCreacion) {
      return jsonResponse({ error: errorCreacion.message }, 400);
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
      return jsonResponse({ error: errorPerfil.message }, 400);
    }

    return jsonResponse({ ok: true });
  } catch (e) {
    return jsonResponse({ error: String(e) }, 500);
  }
});