import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { validarDominioCorreo } from '../lib/validaciones';

export default function InicioSesion() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function iniciarSesion(e) {
    e.preventDefault();

    if (!correo.trim() || !password.trim()) {
      Swal.fire('Datos incompletos', 'Debes ingresar tu correo y tu contraseña.', 'error');
      return;
    }
    if (!validarDominioCorreo(correo)) {
      Swal.fire('Correo no permitido', 'El correo solo puede ser @duoc.cl, @profesor.duoc.cl o @gmail.com.', 'error');
      return;
    }

    setEnviando(true);
    const { error } = await signIn(correo.trim(), password.trim());
    setEnviando(false);

    if (error) {
      Swal.fire('Correo o contraseña incorrectos', error.message, 'error');
      return;
    }
    navigate('/');
  }

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <h1 className="text-center mb-5 fw-bold">Inicio de sesión</h1>

          <form
            onSubmit={iniciarSesion}
            className="p-4 rounded-3 shadow text-white"
            style={{ backgroundColor: '#212529', borderTop: '4px solid rgb(85,205,58)' }}
          >
            <div className="mb-3">
              <label className="form-label fw-bold">Correo</label>
              <input
                type="email"
                className="form-control border-0"
                placeholder="ejemplo@duoc.cl"
                maxLength={100}
                style={{ backgroundColor: '#fdf6e2', color: '#212529' }}
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
              <small className="text-white-50">Solo @duoc.cl, @profesor.duoc.cl o @gmail.com</small>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Contraseña</label>
              <input
                type="password"
                className="form-control border-0"
                minLength={4}
                maxLength={10}
                style={{ backgroundColor: '#fdf6e2', color: '#212529' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <small className="text-white-50">Entre 4 y 10 caracteres.</small>
            </div>

            <div className="mt-4">
              <button
                type="submit"
                disabled={enviando}
                className="btn w-100 fw-bold py-2 text-white"
                style={{ backgroundColor: 'rgb(85,205,58)', border: 'none' }}
              >
                {enviando ? 'Ingresando...' : 'Iniciar Sesión'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
