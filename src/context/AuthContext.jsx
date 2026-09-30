import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  const cargarPerfil = useCallback(async (userId) => {
    if (!userId) {
      setPerfil(null);
      return;
    }
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (!error) setPerfil(data);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session?.user) await cargarPerfil(data.session.user.id);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nuevaSesion) => {
      setSession(nuevaSesion);
      if (nuevaSesion?.user) {
        await cargarPerfil(nuevaSesion.user.id);
      } else {
        setPerfil(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [cargarPerfil]);

  async function signIn(correo, password) {
    const { error } = await supabase.auth.signInWithPassword({ email: correo, password });
    return { error };
  }

  async function signUp({ correo, password, run, nombre, apellidos, fechaNacimiento, region, comuna, direccion }) {
    const { data, error } = await supabase.auth.signUp({ email: correo, password });
    if (error) return { error };

    const userId = data.user?.id;
    if (userId) {
      const { error: errorPerfil } = await supabase.from('perfiles').insert({
        id: userId,
        run,
        nombre,
        apellidos,
        correo,
        fecha_nacimiento: fechaNacimiento || null,
        tipo: 'Cliente',
        region,
        comuna,
        direccion,
      });
      if (errorPerfil) return { error: errorPerfil };
    }
    return { error: null, necesitaConfirmacion: !data.session };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  const value = {
    session,
    usuario: session?.user || null,
    perfil,
    loading,
    signIn,
    signUp,
    signOut,
    refrescarPerfil: () => cargarPerfil(session?.user?.id),
    esAdminOVendedor: perfil?.tipo === 'Administrador' || perfil?.tipo === 'Vendedor',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
