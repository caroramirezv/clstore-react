import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { REGIONES_Y_COMUNAS } from '../data/regionesYComunas';
import { validarRunChileno, formatearRun, validarDominioCorreo } from '../lib/validaciones';

const inputStyle = { backgroundColor: '#fdf6e2', color: '#212529' };

const inicial = {
  run: '', nombre: '', apellidos: '', correo: '', confirmarCorreo: '',
  fechaNacimiento: '', password: '', confirmarPassword: '', region: '', comuna: '', direccion: '',
};

export default function Registro() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(inicial);
  const [enviando, setEnviando] = useState(false);

  const comunasDisponibles = REGIONES_Y_COMUNAS.find((r) => r.region === form.region)?.comunas || [];

  function actualizar(campo, valor) {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
      ...(campo === 'region' ? { comuna: '' } : {}),
    }));
  }

  async function registrar(e) {
    e.preventDefault();

    const { run, nombre, apellidos, correo, confirmarCorreo, password, confirmarPassword, region, comuna, direccion } = form;

    if (!run || !nombre || !apellidos || !correo || !confirmarCorreo || !password || !confirmarPassword || !region || !comuna || !direccion) {
      Swal.fire('Campos Incompletos', 'Por favor, completa todos los campos requeridos para continuar.', 'error');
      return;
    }
    if (!validarRunChileno(run)) {
      Swal.fire('RUN Inválido', 'El RUN ingresado no es válido. Ingrésalo sin puntos ni guion (Ej: 190110222 o 10000013K).', 'error');
      return;
    }
    if (!validarDominioCorreo(correo)) {
      Swal.fire('Correo no permitido', 'El correo solo puede ser @duoc.cl, @profesor.duoc.cl o @gmail.com.', 'error');
      return;
    }
    if (correo.toLowerCase() !== confirmarCorreo.toLowerCase()) {
      Swal.fire('Error de Correo', 'Los correos electrónicos ingresados no coinciden.', 'error');
      return;
    }
    if (password.length < 4 || password.length > 10) {
      Swal.fire('Contraseña Inválida', 'La contraseña debe tener entre 4 y 10 caracteres.', 'error');
      return;
    }
    if (password !== confirmarPassword) {
      Swal.fire('Error de Contraseña', 'Las contraseñas ingresadas no coinciden.', 'error');
      return;
    }

    setEnviando(true);
    const { error, necesitaConfirmacion } = await signUp({
      correo,
      password,
      run: formatearRun(run),
      nombre,
      apellidos,
      fechaNacimiento: form.fechaNacimiento,
      region,
      comuna,
      direccion,
    });
    setEnviando(false);

    if (error) {
      Swal.fire('No se pudo registrar', error.message, 'error');
      return;
    }

    Swal.fire({
      title: '¡Registro Exitoso!',
      text: necesitaConfirmacion
        ? 'Revisa tu correo para confirmar la cuenta antes de iniciar sesión.'
        : 'Tu cuenta se ha creado correctamente. Redirigiendo...',
      icon: 'success',
    }).then(() => navigate('/iniciar-sesion'));
  }

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <h1 className="text-center mb-4 fw-bold text-white">Registro</h1>

          <form onSubmit={registrar} className="p-4 rounded-3 shadow text-white" style={{ backgroundColor: '#212529', borderTop: '4px solid #800000' }}>
            <div className="mb-3 text-start">
              <label className="form-label fw-bold">RUN</label>
              <input type="text" className="form-control border-0" placeholder="Ej: 19011022K (Sin puntos ni guion)" minLength={7} maxLength={9} style={inputStyle} value={form.run} onChange={(e) => actualizar('run', e.target.value)} required />
              <small className="text-white-50">Sin puntos ni guion (7 a 9 caracteres).</small>
            </div>

            <div className="mb-3 text-start">
              <label className="form-label fw-bold">Nombre</label>
              <input type="text" className="form-control border-0" maxLength={50} style={inputStyle} value={form.nombre} onChange={(e) => actualizar('nombre', e.target.value)} required />
            </div>

            <div className="mb-3 text-start">
              <label className="form-label fw-bold">Apellidos</label>
              <input type="text" className="form-control border-0" maxLength={100} style={inputStyle} value={form.apellidos} onChange={(e) => actualizar('apellidos', e.target.value)} required />
            </div>

            <div className="mb-3 text-start">
              <label className="form-label fw-bold">Correo</label>
              <input type="email" className="form-control border-0" placeholder="ejemplo@duoc.cl" maxLength={100} style={inputStyle} value={form.correo} onChange={(e) => actualizar('correo', e.target.value)} required />
              <small className="text-white-50">Solo @duoc.cl, @profesor.duoc.cl o @gmail.com</small>
            </div>

            <div className="mb-3 text-start">
              <label className="form-label fw-bold">Confirmar Correo</label>
              <input type="email" className="form-control border-0" style={inputStyle} value={form.confirmarCorreo} onChange={(e) => actualizar('confirmarCorreo', e.target.value)} required />
            </div>

            <div className="mb-3 text-start">
              <label className="form-label fw-bold">Fecha de Nacimiento (Opcional)</label>
              <input type="date" className="form-control border-0" style={inputStyle} value={form.fechaNacimiento} onChange={(e) => actualizar('fechaNacimiento', e.target.value)} />
            </div>

            <div className="mb-3 text-start">
              <label className="form-label fw-bold">Contraseña</label>
              <input type="password" className="form-control border-0" minLength={4} maxLength={10} style={inputStyle} value={form.password} onChange={(e) => actualizar('password', e.target.value)} required />
              <small className="text-white-50">Entre 4 y 10 caracteres.</small>
            </div>

            <div className="mb-3 text-start">
              <label className="form-label fw-bold">Confirmar Contraseña</label>
              <input type="password" className="form-control border-0" style={inputStyle} value={form.confirmarPassword} onChange={(e) => actualizar('confirmarPassword', e.target.value)} required />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6 text-start">
                <label className="form-label fw-bold">Región</label>
                <select className="form-select border-0" style={inputStyle} value={form.region} onChange={(e) => actualizar('region', e.target.value)} required>
                  <option value="" disabled>-- Seleccione región --</option>
                  {REGIONES_Y_COMUNAS.map((r) => (
                    <option key={r.region} value={r.region}>{r.region}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6 text-start">
                <label className="form-label fw-bold">Comuna</label>
                <select className="form-select border-0" style={inputStyle} value={form.comuna} onChange={(e) => actualizar('comuna', e.target.value)} required disabled={!form.region}>
                  <option value="" disabled>-- Seleccione comuna --</option>
                  {comunasDisponibles.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-3 text-start">
              <label className="form-label fw-bold">Dirección</label>
              <input type="text" className="form-control border-0" maxLength={300} style={inputStyle} value={form.direccion} onChange={(e) => actualizar('direccion', e.target.value)} required />
            </div>

            <div className="mb-3 text-center">
              <span className="text-light small">¿Ya tienes cuenta? </span>
              <Link to="/iniciar-sesion" className="text-warning fw-bold text-decoration-none small">Inicia Sesión</Link>
            </div>

            <button type="submit" disabled={enviando} className="btn w-100 fw-bold py-2 text-white" style={{ backgroundColor: '#800000', border: 'none' }}>
              {enviando ? 'Registrando...' : 'Registrarse'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
