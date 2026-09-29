// @ts-ignore: Deno resolves this HTTPS import at runtime.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  // Manejo de la petición Preflight CORS enviada por el navegador
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');

    // Cliente anon solo para validar al usuario que llama
    const supabaseAnon = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: errorUsuario } = await supabaseAnon.auth.getUser(token);
    if (errorUsuario || !user) {
      return new Response(JSON.stringify({ error: 'No autenticado.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Cliente admin
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: perfilLlamador } = await supabaseAdmin
      .from('perfiles')
      .select('tipo')
      .eq('id', user.id)
      .single();

    if (!perfilLlamador || !['Administrador', 'Vendedor'].includes(perfilLlamador.tipo)) {
      return new Response(JSON.stringify({ error: 'No tienes permisos para crear usuarios.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { run, tipo, nombre, apellidos, correo, fechaNacimiento, password, region, comuna, direccion } = body;

    const { data: nuevoUsuario, error: errorCreacion } = await supabaseAdmin.auth.admin.createUser({
      email: correo,
      password,
      email_confirm: true,
    });
    if (errorCreacion) {
      return new Response(JSON.stringify({ error: errorCreacion.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
      // Revertir la creación del usuario si falla el perfil
      await supabaseAdmin.auth.admin.deleteUser(nuevoUsuario.user.id);
      return new Response(JSON.stringify({ error: errorPerfil.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
