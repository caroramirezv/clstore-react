import { useEffect, useState } from 'react';
import { Modal } from 'bootstrap';
import Swal from 'sweetalert2';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { REGIONES_Y_COMUNAS } from '../../data/regionesYComunas';
import { validarRunChileno, formatearRun } from '../../lib/validaciones';

const formVacio = {
  id: null, run: '', tipo: 'Cliente', nombre: '', apellidos: '', correo: '',
  fechaNacimiento: '', password: '', region: '', comuna: '', direccion: '',
};

export default function AdminUsuarios() {
  const { usuario: usuarioActivo } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState(formVacio);
  const [esEdicion, setEsEdicion] = useState(false);

  const comunasDisponibles = REGIONES_Y_COMUNAS.find((r) => r.region === form.region)?.comunas || [];

  async function cargarUsuarios() {
    const { data } = await supabase.from('perfiles').select('*').order('nombre');
    setUsuarios(data || []);
  }

  useEffect(() => {
    cargarUsuarios();
  }, []);

  function abrirCreacion() {
    setForm(formVacio);
    setEsEdicion(false);
  }

  function abrirEdicion(u) {
    setForm({
      id: u.id, run: u.run || '', tipo: u.tipo || 'Cliente', nombre: u.nombre || '', apellidos: u.apellidos || '',
      correo: u.correo || '', fechaNacimiento: u.fecha_nacimiento || '', password: '',
      region: u.region || '', comuna: u.comuna || '', direccion: u.direccion || '',
    });
    setEsEdicion(true);
  }

  function cerrarModal() {
    Modal.getInstance(document.getElementById('modalUsuario'))?.hide();
  }

  async function guardar(e) {
    e.preventDefault();
    const { run, tipo, nombre, apellidos, correo, fechaNacimiento, password, region, comuna, direccion } = form;
    const runFormateado = formatearRun(run);

    if (!validarRunChileno(run)) {
      Swal.fire('RUN inválido', 'Ingresa el RUN sin puntos ni guion (Ej: 190110222 o 10000013K).', 'error');
      return;
    }
    if (!nombre || !apellidos || !correo || !region || !comuna || !direccion) {
      Swal.fire('Datos incompletos', 'Completa todos los campos obligatorios.', 'error');
      return;
    }
    if (!esEdicion && (password.length < 4 || password.length > 10)) {
      Swal.fire('Contraseña inválida', 'La contraseña debe tener entre 4 y 10 caracteres.', 'error');
      return;
    }

    if (esEdicion) {
      // Actualiza los datos de negocio en "perfiles". El correo/contraseña de Auth
      // no se pueden cambiar desde aquí sin privilegios de administrador de Supabase
      // (ver nota de la Edge Function en el README).
      const { error } = await supabase
        .from('perfiles')
        .update({ tipo, nombre, apellidos, correo, fecha_nacimiento: fechaNacimiento || null, region, comuna, direccion })
        .eq('id', form.id);
      if (error) { Swal.fire('Error', error.message, 'error'); return; }
    } else {
      // Crear un usuario nuevo (con su propia cuenta de Auth) desde el panel admin
      // requiere la Edge Function "create-user" incluida en /supabase/functions.
      const { data: sesionActual } = await supabase.auth.getSession();
      const { error } = await supabase.functions.invoke('create-user', {
        body: { run: runFormateado, tipo, nombre, apellidos, correo, fechaNacimiento, password, region, comuna, direccion },
        headers: { Authorization: `Bearer ${sesionActual.session?.access_token}` },
      });
      if (error) {
        Swal.fire(
          'No se pudo crear el usuario',
          'Revisa que la Edge Function "create-user" esté desplegada en tu proyecto de Supabase (ver README). Detalle: ' + error.message,
          'error'
        );
        return;
      }
    }

    await cargarUsuarios();
    cerrarModal();
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: esEdicion ? 'Usuario actualizado' : 'Usuario creado', showConfirmButton: false, timer: 1500 });
  }

  async function eliminar(u) {
    if (usuarioActivo && usuarioActivo.id === u.id) {
      Swal.fire('No permitido', 'No puedes eliminar el usuario con el que iniciaste sesión.', 'error');
      return;
    }
    const resultado = await Swal.fire({
      title: '¿Eliminar usuario?', text: 'Esta acción no se puede deshacer.', icon: 'warning',
      showCancelButton: true, confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar', confirmButtonColor: '#800000',
    });
    if (!resultado.isConfirmed) return;

    // Borra el perfil. Para borrar también la cuenta de Auth se necesita la misma
    // Edge Function con privilegios de servicio (ver README).
    const { error } = await supabase.from('perfiles').delete().eq('id', u.id);
    if (error) { Swal.fire('Error', error.message, 'error'); return; }
    await cargarUsuarios();
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Usuario eliminado', showConfirmButton: false, timer: 1500 });
  }

  return (
    <section className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold m-0"><i className="fa-solid fa-users me-2"></i>Mantenedor de Usuarios</h4>
        <button className="btn btn-primary rounded-pill px-4" data-bs-toggle="modal" data-bs-target="#modalUsuario" onClick={abrirCreacion}>
          <i className="fa-solid fa-user-plus me-2"></i>Nuevo Usuario
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr><th>RUN</th><th>Nombre Completo</th><th>Correo</th><th>Tipo</th><th>Ubicación</th><th className="text-end pe-4">Acciones</th></tr>
              </thead>
              <tbody>
                {usuarios.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-muted py-4">No hay usuarios guardados todavía.</td></tr>
                )}
                {usuarios.map((u) => (
                  <tr key={u.id}>
                    <td className="text-muted">{u.run}</td>
                    <td className="fw-semibold">{u.nombre} {u.apellidos || ''}</td>
                    <td>{u.correo}</td>
                    <td>
                      <span className={`badge ${u.tipo === 'Administrador' ? 'bg-danger' : u.tipo === 'Vendedor' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                        {u.tipo}
                      </span>
                    </td>
                    <td>{u.comuna || ''}{u.comuna && u.region ? ', ' : ''}{u.region || ''}</td>
                    <td className="text-end pe-4">
                      <button className="btn btn-sm btn-outline-primary rounded-pill me-1" data-bs-toggle="modal" data-bs-target="#modalUsuario" onClick={() => abrirEdicion(u)}>
                        <i className="fa-solid fa-pen"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => eliminar(u)}>
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="modal fade" id="modalUsuario" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title fw-bold">{esEdicion ? 'Editar Usuario' : 'Nuevo Usuario'}</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form onSubmit={guardar}>
              <div className="modal-body row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">RUN *</label>
                  <input type="text" className="form-control" minLength={7} maxLength={9} required disabled={esEdicion}
                    placeholder="Sin puntos ni guion (Ej: 19011022K)"
                    value={form.run} onChange={(e) => setForm({ ...form, run: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Tipo de Usuario *</label>
                  <select className="form-select" required value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                    <option value="Administrador">Administrador</option>
                    <option value="Cliente">Cliente</option>
                    <option value="Vendedor">Vendedor</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Nombre *</label>
                  <input type="text" className="form-control" maxLength={50} required
                    value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Apellidos *</label>
                  <input type="text" className="form-control" maxLength={100} required
                    value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Correo Electrónico *</label>
                  <input type="email" className="form-control" maxLength={100} required disabled={esEdicion}
                    placeholder="@duoc.cl, @profesor.duoc.cl o @gmail.com"
                    value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} />
                  {esEdicion && <small className="text-muted">El correo de acceso no se puede editar aquí.</small>}
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Fecha Nacimiento (Opcional)</label>
                  <input type="date" className="form-control"
                    value={form.fechaNacimiento || ''} onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Contraseña {esEdicion ? '' : '*'}</label>
                  <input type="password" className="form-control" minLength={4} maxLength={10}
                    placeholder={esEdicion ? 'No editable desde aquí' : 'Entre 4 y 10 caracteres'}
                    disabled={esEdicion}
                    value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                  <small className="text-muted">{esEdicion ? 'La contraseña la cambia el propio usuario.' : 'Requerida (entre 4 y 10 caracteres).'}</small>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Región *</label>
                  <select className="form-select" required value={form.region}
                    onChange={(e) => setForm({ ...form, region: e.target.value, comuna: '' })}>
                    <option value="">Seleccione Región</option>
                    {REGIONES_Y_COMUNAS.map((r) => <option key={r.region} value={r.region}>{r.region}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Comuna *</label>
                  <select className="form-select" required disabled={!form.region} value={form.comuna}
                    onChange={(e) => setForm({ ...form, comuna: e.target.value })}>
                    <option value="">Seleccione primero una Región</option>
                    {comunasDisponibles.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Dirección *</label>
                  <input type="text" className="form-control" maxLength={300} required
                    value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary rounded-pill" data-bs-dismiss="modal">Cancelar</button>
                <button type="submit" className="btn btn-primary rounded-pill">Guardar Usuario</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
