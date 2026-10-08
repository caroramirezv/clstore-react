import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { REGIONES_Y_COMUNAS } from '../data/regionesYComunas';
import { formatoCLP, calcularPrecioFinal } from '../lib/validaciones';

export default function Checkout() {
  const navigate = useNavigate();
  const { perfil, usuario } = useAuth();
  const { items, total, vaciarCarrito } = useCart();

  const [form, setForm] = useState({
    nombre: perfil?.nombre || '',
    apellidos: perfil?.apellidos || '',
    correo: perfil?.correo || usuario?.email || '',
    telefono: '',
    region: perfil?.region || '',
    comuna: perfil?.comuna || '',
    direccion: perfil?.direccion || '',
    metodoPago: 'tarjeta',
  });
  const [procesando, setProcesando] = useState(false);

  const comunasDisponibles = REGIONES_Y_COMUNAS.find((r) => r.region === form.region)?.comunas || [];

  function actualizar(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor, ...(campo === 'region' ? { comuna: '' } : {}) }));
  }

  if (items.length === 0) {
    return (
      <div className="container my-5 text-center">
        <i className="fa-solid fa-cart-flatbed-suitcases fa-3x text-muted mb-3"></i>
        <p className="fs-5 text-muted">Tu carrito está vacío, no hay nada que pagar.</p>
        <Link to="/productos" className="btn btn-primary rounded-pill">Ver Productos</Link>
      </div>
    );
  }

  async function confirmarPago(e) {
    e.preventDefault();
    const { nombre, apellidos, correo, telefono, region, comuna, direccion } = form;
    if (!nombre || !apellidos || !correo || !region || !comuna || !direccion) {
      return;
    }

    setProcesando(true);

    const itemsParaOrden = items.map((it) => ({ producto_id: it.producto_id, cantidad: it.cantidad }));

    const { data, error } = await supabase.rpc('crear_orden', {
      p_usuario_id: usuario?.id || null,
      p_nombre: nombre,
      p_apellidos: apellidos,
      p_correo: correo,
      p_telefono: telefono || null,
      p_region: region,
      p_comuna: comuna,
      p_direccion: direccion,
      p_items: itemsParaOrden,
    });

    setProcesando(false);

    if (error) {
      // El carrito NO se vacía: el stock tampoco se tocó (la función es atómica),
      // así que la persona puede ajustar cantidades y volver a intentar.
      navigate('/resumen-compra', { state: { exito: false, motivo: error.message } });
      return;
    }

    const itemsResumen = items.map((it) => {
      const { precioFinal } = calcularPrecioFinal(it.productos);
      return { nombre: it.productos?.nombre, cantidad: it.cantidad, precio: precioFinal };
    });

    await vaciarCarrito();
    navigate(`/resumen-compra/${data.orden_id}`, {
      state: {
        exito: true,
        ordenId: data.orden_id,
        total: data.total,
        items: itemsResumen,
        comprador: { nombre, apellidos, correo, region, comuna, direccion },
      },
    });
  }

  return (
    <div className="container my-5">
      <h2 className="fw-bold mb-4"><i className="fa-solid fa-lock me-2"></i>Finalizar Compra</h2>

      <div className="row g-4">
        <div className="col-lg-7">
          <form onSubmit={confirmarPago} className="card border-0 shadow-sm rounded-4 p-4">
            <h5 className="fw-bold mb-3">Datos del comprador</h5>
            {usuario && (
              <p className="text-muted small mb-3">
                <i className="fa-solid fa-circle-check text-success me-1"></i>
                Completamos estos datos con tu perfil; puedes editarlos si este pedido es para otra persona.
              </p>
            )}
            <div className="row g-3 mb-2">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Nombre *</label>
                <input type="text" className="form-control" required value={form.nombre} onChange={(e) => actualizar('nombre', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Apellidos *</label>
                <input type="text" className="form-control" required value={form.apellidos} onChange={(e) => actualizar('apellidos', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Correo *</label>
                <input type="email" className="form-control" required value={form.correo} onChange={(e) => actualizar('correo', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Teléfono (Opcional)</label>
                <input type="tel" className="form-control" placeholder="+56 9 1234 5678" value={form.telefono} onChange={(e) => actualizar('telefono', e.target.value)} />
              </div>
            </div>

            <h5 className="fw-bold mb-3 mt-4">Dirección de envío</h5>
            <div className="row g-3 mb-2">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Región *</label>
                <select className="form-select" required value={form.region} onChange={(e) => actualizar('region', e.target.value)}>
                  <option value="">Seleccione región</option>
                  {REGIONES_Y_COMUNAS.map((r) => <option key={r.region} value={r.region}>{r.region}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Comuna *</label>
                <select className="form-select" required disabled={!form.region} value={form.comuna} onChange={(e) => actualizar('comuna', e.target.value)}>
                  <option value="">Seleccione comuna</option>
                  {comunasDisponibles.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold">Dirección *</label>
                <input type="text" className="form-control" required value={form.direccion} onChange={(e) => actualizar('direccion', e.target.value)} />
              </div>
            </div>

            <h5 className="fw-bold mb-3 mt-4">Método de pago</h5>
            <select className="form-select mb-2" value={form.metodoPago} onChange={(e) => actualizar('metodoPago', e.target.value)}>
              <option value="tarjeta">Tarjeta de crédito/débito</option>
              <option value="transferencia">Transferencia bancaria</option>
            </select>
            <small className="text-muted d-block mb-4">
              Pago simulado para efectos de esta entrega: no se procesa ningún cobro real.
            </small>

            <button type="submit" disabled={procesando} className="btn btn-primary rounded-pill w-100 py-2 fw-bold">
              {procesando ? 'Procesando pago...' : `Pagar ${formatoCLP(total)}`}
            </button>
          </form>
        </div>

        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h5 className="fw-bold mb-4">Resumen de tu pedido</h5>
            {items.map((it) => {
              const { precioFinal } = calcularPrecioFinal(it.productos);
              return (
                <div key={it.producto_id} className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center">
                    <img src={it.productos?.imagen} alt={it.productos?.nombre} style={{ width: 48, height: 48, objectFit: 'cover' }} className="rounded me-3" />
                    <div>
                      <div className="fw-semibold">{it.productos?.nombre}</div>
                      <div className="text-muted small">x{it.cantidad}</div>
                    </div>
                  </div>
                  <span className="fw-semibold">{formatoCLP(precioFinal * it.cantidad)}</span>
                </div>
              );
            })}
            <hr />
            <div className="d-flex justify-content-between fs-5">
              <span className="fw-bold">Total:</span>
              <span className="fw-bold text-primary">{formatoCLP(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
