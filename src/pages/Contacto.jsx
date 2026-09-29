import { useState } from 'react';
import Swal from 'sweetalert2';
import { supabase } from '../lib/supabaseClient';

const inputStyle = { backgroundColor: '#fdf6e2', color: '#212529' };

export default function Contacto() {
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' });
  const [enviando, setEnviando] = useState(false);

  function actualizar(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function enviar(e) {
    e.preventDefault();
    if (!form.nombre.trim() || !form.email.trim() || !form.mensaje.trim()) {
      Swal.fire('Campos incompletos', 'Por favor completa todos los campos correctamente.', 'error');
      return;
    }

    setEnviando(true);
    const { error } = await supabase.from('contactos').insert({
      nombre: form.nombre.trim(),
      email: form.email.trim(),
      mensaje: form.mensaje.trim(),
    });
    setEnviando(false);

    if (error) {
      Swal.fire('No se pudo enviar', error.message, 'error');
      return;
    }

    setForm({ nombre: '', email: '', mensaje: '' });
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Mensaje enviado. ¡Gracias por escribirnos!',
      showConfirmButton: false,
      timer: 2000,
    });
  }

  return (
    <div className="container my-5">
      <h1 className="text-center mb-5 fw-bold" style={{ color: '#f6f7f8' }}>Contacta con nosotros</h1>

      <div className="row g-4 align-items-stretch">
        <div className="col-lg-5">
          <div
            className="p-4 rounded-3 h-100 shadow text-white d-flex flex-column justify-content-center"
            style={{ backgroundColor: '#212529', borderTop: '4px solid #800000' }}
          >
            <h2 className="h4 mb-3 fw-bold text-white">¿Tienes alguna duda o sugerencia?</h2>
            <p className="text-light mb-0" style={{ opacity: 0.9 }}>
              Ponte en contacto con nosotros para cualquier consulta sobre cómo publicar tus productos en{' '}
              <strong className="text-white">Clstore</strong> o para compartir tus comentarios. ¡Nos encanta
              escucharte y responderemos a la mayor brevedad posible!
            </p>
          </div>
        </div>

        <div className="col-lg-7">
          <form
            onSubmit={enviar}
            className="p-4 rounded-3 shadow text-white"
            style={{ backgroundColor: '#212529', borderTop: '4px solid #800000' }}
          >
            <div className="mb-3">
              <label className="form-label fw-bold">Nombre</label>
              <input
                type="text"
                className="form-control border-0"
                placeholder="Ej: Juan Pérez"
                maxLength={100}
                style={inputStyle}
                value={form.nombre}
                onChange={(e) => actualizar('nombre', e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Email</label>
              <input
                type="email"
                className="form-control border-0"
                placeholder="juan@duoc.cl"
                maxLength={100}
                style={inputStyle}
                value={form.email}
                onChange={(e) => actualizar('email', e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Comentario</label>
              <textarea
                className="form-control border-0"
                placeholder="Tu comentario..."
                maxLength={500}
                rows={5}
                style={inputStyle}
                value={form.mensaje}
                onChange={(e) => actualizar('mensaje', e.target.value)}
                required
              />
            </div>

            <div className="mt-4">
              <button
                type="submit"
                disabled={enviando}
                className="btn w-100 fw-bold py-2 text-white"
                style={{ backgroundColor: '#800000', border: 'none' }}
              >
                {enviando ? 'Enviando...' : 'Enviar Mensaje'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-5 pt-4">
        <h2 className="text-center mb-4 h3 fw-bold" style={{ color: '#eeeff0' }}>Nuestras Tiendas</h2>
        <div className="row g-4">
          {[
            ['Providencia', 'Av. Andrés Bello 2425, Oficina 803, Santiago', '+56 9 8412 3765'],
            ['Las Condes', 'Av. Apoquindo 4700, Local 12, Santiago', '+56 9 7321 9854'],
            ['Santiago Centro', 'Calle Moneda 970, Piso 5, Santiago', '+56 9 6158 4239'],
          ].map(([nombre, direccion, telefono]) => (
            <div className="col-md-4" key={nombre}>
              <div
                className="card h-100 border-0 shadow p-3 text-center text-white"
                style={{ backgroundColor: '#212529', borderBottom: '3px solid #800000' }}
              >
                <h3 className="h5 fw-bold mb-2 text-white">{nombre}</h3>
                <p className="mb-2 text-light small opacity-75">{direccion}</p>
                <p className="fw-bold mb-0 text-warning">📞 {telefono}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
