import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatoCLP } from '../lib/validaciones';
import { REGIONES_Y_COMUNAS } from '../data/regionesYComunas';
import BoletaModal from '../components/boletaModal';
import { supabase } from '../lib/supabaseClient';
export default function Checkout() {
  const { items, total, vaciarCarrito } = useCart();
  const { usuario, perfil } = useAuth();
  const navigate = useNavigate();

  const listaRegiones = Array.isArray(REGIONES_Y_COMUNAS) ? REGIONES_Y_COMUNAS : [];
  const regionInicial = listaRegiones[0]?.region || 'Arica y Parinacota';
  const comunaInicial = listaRegiones[0]?.comunas?.[0] || 'Arica';

  // Estados del flujo de pago: 'formulario' | 'exito' | 'error'
  const [estadoPago, setEstadoPago] = useState('formulario');
  const [numOrden, setNumOrden] = useState('');
  const [codigoOrden, setCodigoOrden] = useState('');
  const [simularError, setSimularError] = useState(false);
  const [mostrarBoleta, setMostrarBoleta] = useState(false);

  // Resguardo del resumen de compra al procesar el pago
  const [resumenCompra, setResumenCompra] = useState({ items: [], total: 0 });

  const [formData, setFormData] = useState({
    rut:'',
    nombre: '',
    apellidos: '',
    correo: '',
    calle: '',
    departamento: '',
    region: regionInicial,
    comuna: comunaInicial,
    indicaciones: '',
  });

  // Autocompletado de datos del usuario autenticado
  useEffect(() => {
    if (usuario || perfil) {
      const correoUsuario = usuario?.email || perfil?.email || '';
      const nombreUsuario =
        perfil?.nombre ||
        usuario?.user_metadata?.nombre ||
        usuario?.displayName?.split(' ')[0] ||
        '';

      const apellidosUsuario =
        perfil?.apellidos ||
        perfil?.apellido ||
        usuario?.user_metadata?.apellidos ||
        usuario?.displayName?.split(' ').slice(1).join(' ') ||
        '';

      const calleUsuario = perfil?.calle || perfil?.direccion || '';
      const deptoUsuario = perfil?.departamento || perfil?.depto || '';
      const indicacionesUsuario = perfil?.indicaciones || '';

      const regionPerfil = perfil?.region || '';
      const regionEncontrada = listaRegiones.find((r) => r.region === regionPerfil);

      let regionFinal = regionInicial;
      let comunaFinal = comunaInicial;

      if (regionEncontrada) {
        regionFinal = regionEncontrada.region;
        if (regionEncontrada.comunas.includes(perfil?.comuna)) {
          comunaFinal = perfil.comuna;
        } else {
          comunaFinal = regionEncontrada.comunas[0] || '';
        }
      }

      setFormData((prev) => ({
        ...prev,
        nombre: nombreUsuario || prev.nombre,
        apellidos: apellidosUsuario || prev.apellidos,
        correo: correoUsuario || prev.correo,
        calle: calleUsuario || prev.calle,
        departamento: deptoUsuario || prev.departamento,
        region: regionFinal,
        comuna: comunaFinal,
        indicaciones: indicacionesUsuario || prev.indicaciones,
      }));
    }
  }, [usuario, perfil]);

  const regionSeleccionadaObj = listaRegiones.find((r) => r.region === formData.region);
  const comunasDisponibles = regionSeleccionadaObj?.comunas || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegionChange = (e) => {
    const nuevaRegion = e.target.value;
    const regionObj = listaRegiones.find((r) => r.region === nuevaRegion);
    const primeraComuna = regionObj?.comunas?.[0] || '';

    setFormData((prev) => ({
      ...prev,
      region: nuevaRegion,
      comuna: primeraComuna,
    }));
  };

  const handlePagar = async (e) => {
  e.preventDefault();

  if (simularError) {            // el error simulado queda igual que hoy
    setNumOrden(Math.floor(10000000 + Math.random() * 90000000));
    setResumenCompra({ items: [...items], total });
    setEstadoPago('error');
    return;
  }

  const { data: boleta, error } = await supabase.rpc('crear_boleta', {
    p_cliente: formData,
    p_items: items.map((it) => ({ producto_id: it.producto_id, cantidad: it.cantidad })),
  });

  if (error) {                   // por ejemplo "Stock insuficiente para ..."
    Swal.fire({ icon: 'error', title: 'No se pudo pagar', text: error.message });
    setEstadoPago('error');
    return;
  }

  setNumOrden(boleta.folio);
  setCodigoOrden(boleta.codigo_boleta);
  setResumenCompra({ items: [...items], total: boleta.total_boleta });
  setEstadoPago('exito');
  vaciarCarrito();
};

  const handleEnviarBoleta = () => {
    Swal.fire({
      title: '¡Boleta enviada!',
      text: `Se ha enviado la boleta electrónica en PDF al correo: ${formData.correo}`,
      icon: 'success',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#198754',
    });
  };

  const itemsAMostrar = estadoPago === 'formulario' ? items : resumenCompra.items;
  const totalAMostrar = estadoPago === 'formulario' ? total : resumenCompra.total;

  if (items.length === 0 && estadoPago === 'formulario') {
    return (
      <div className="container text-center py-5">
        <h4>No hay productos en tu carrito para procesar el pago.</h4>
        <button className="btn btn-primary rounded-pill mt-3" onClick={() => navigate('/productos')}>
          Ver Productos
        </button>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-4 text-dark">
      <div className="container" style={{ maxWidth: '850px' }}>
        <form onSubmit={handlePagar} className="bg-white p-4 p-md-5 rounded shadow-sm border">

          {/* 1. HEADER COMPRA EXITOSA */}
          {estadoPago === 'exito' && (
            <div className="mb-4 pb-2 border-bottom">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                <div className="d-flex align-items-center gap-2">
                  <span
                    className="text-success border border-success rounded-circle d-inline-flex justify-content-center align-items-center fw-bold"
                    style={{ width: '28px', height: '28px', fontSize: '15px' }}
                  >
                    ✓
                  </span>
                  <h2 className="h4 fw-bold text-dark m-0">
                    Se ha realizado la compra. nro #{numOrden}
                  </h2>
                </div>
                <span className="text-muted small align-self-center">
                  Código orden: <strong>{codigoOrden}</strong>
                </span>
              </div>
              <small className="text-muted d-block">Comprobante de compra emitido correctamente</small>
            </div>
          )}

          {/* 2. HEADER ERROR DE PAGO */}
          {estadoPago === 'error' && (
            <div className="text-center mb-4 pb-3 border-bottom">
              <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                <span
                  className="text-danger border border-danger rounded-circle d-inline-flex justify-content-center align-items-center fw-bold"
                  style={{ width: '28px', height: '28px', fontSize: '14px' }}
                >
                  ✕
                </span>
                <h2 className="h4 fw-bold text-secondary m-0">
                  No se pudo realizar el pago. nro #{numOrden}
                </h2>
              </div>
              <p className="text-muted small mb-3">Detalle de la transacción fallida</p>

              <button
                type="button"
                className="btn btn-success fw-bold px-4 py-2 rounded-2 text-uppercase"
                onClick={() => setEstadoPago('formulario')}
              >
                VOLVER A REALIZAR EL PAGO
              </button>
            </div>
          )}

          {/* 3. HEADER FORMULARIO ACTIVO */}
          {estadoPago === 'formulario' && (
            <>
              {usuario && (
                <div className="alert alert-info py-2 px-3 mb-4 small d-flex align-items-center justify-content-between">
                  <span>💡 Sesión iniciada como <strong>{formData.correo}</strong>. Datos autocompletados.</span>
                </div>
              )}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h2 className="h4 fw-bold m-0">Carrito de compra</h2>
                  <small className="text-muted">Completa la siguiente información</small>
                </div>
                <span className="badge bg-primary px-3 py-2 fs-6">
                  Total a pagar: {formatoCLP(total)}
                </span>
              </div>
            </>
          )}

          {/* VISTA DINÁMICA: INPUTS DE EDICIÓN vs FICHA DE RECEPTOR TIPO BOLETA */}
          {estadoPago === 'formulario' ? (
            /* A. MIENTRAS SE LLENA EL CHECKOUT (INPUTS ACTIVOS) */
            <fieldset className="border-0 p-0 m-0">
              <div className="row g-3 mb-4">
                {/* INPUT RUT */}
                <div className="col-md-3">
                  <label className="form-label text-muted small fw-semibold">RUT*</label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    name="rut"
                    placeholder="12.345.678-K"
                    value={formData.rut}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="col-md-4">
                  <label className="form-label text-muted small fw-semibold">Nombre*</label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>
                

                <div className="col-md-4">
                  <label className="form-label text-muted small fw-semibold">Apellidos*</label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleChange}
                    required
                  />
                </div>
                

                <div className="col-md-4">
                  <label className="form-label text-muted small fw-semibold">Correo*</label>
                  <input
                    type="email"
                    className="form-control bg-light"
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <h3 className="h6 fw-bold mb-3 text-secondary">Dirección de entrega de los productos</h3>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-semibold">Calle*</label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      name="calle"
                      value={formData.calle}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-semibold">Departamento (opcional)</label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      placeholder="Ej: 603"
                      name="departamento"
                      value={formData.departamento}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-semibold">Región*</label>
                    <select
                      className="form-select bg-light"
                      name="region"
                      value={formData.region}
                      onChange={handleRegionChange}
                      required
                    >
                      {listaRegiones.map((reg) => (
                        <option key={reg.region} value={reg.region}>
                          {reg.region}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-semibold">Comuna*</label>
                    <select
                      className="form-select bg-light"
                      name="comuna"
                      value={formData.comuna}
                      onChange={handleChange}
                      required
                    >
                      {comunasDisponibles.map((com) => (
                        <option key={com} value={com}>
                          {com}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label text-muted small fw-semibold">Indicaciones para la entrega (opcional)</label>
                    <textarea
                      className="form-control bg-light"
                      rows="2"
                      placeholder="Ej.: Entre calles, color del edificio, no tiene timbre."
                      name="indicaciones"
                      value={formData.indicaciones}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>
              </div>
            </fieldset>
          ) : (
            /* B. UNA VEZ PAGADO: FICHA FISCAL DE RECEPTOR (ESTILO BOLETA) */
            <div className="border border-2 border-dark rounded-3 p-3 mb-4 bg-white shadow-sm">
              <div className="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom">
                <span className="badge bg-danger text-uppercase px-2 py-1" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                  RECEPTOR BOLETA ELECTRÓNICA
                </span>
                <span className="small text-muted font-monospace">
                  FOLIO N° <strong className="text-danger">{numOrden}</strong>
                </span>
              </div>

              <div className="row g-2 text-uppercase font-monospace" style={{ fontSize: '13px', color: '#212529' }}>
                <div className="col-md-6">
                  <div className="mb-1">
                    <span className="text-secondary fw-normal">SEÑOR(A):</span> <strong>{formData.nombre} {formData.apellidos}</strong>
                  </div>
                  <div className="mb-1">
                    <span className="text-secondary fw-normal">CORREO:</span> <strong className="text-lowercase">{formData.correo}</strong>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-1">
                    <span className="text-secondary fw-normal">DIRECCIÓN:</span> <strong>{formData.calle} {formData.departamento && `(DEPTO/CASA ${formData.departamento})`}</strong>
                  </div>
                  <div className="mb-1">
                    <span className="text-secondary fw-normal">COMUNA/REGIÓN:</span> <strong>{formData.comuna}, {formData.region}</strong>
                  </div>
                </div>

                {formData.indicaciones && (
                  <div className="col-12 mt-2 pt-2 border-top text-lowercase font-sans-serif">
                    <span className="fw-bold text-uppercase text-secondary small">Nota despacho:</span>{" "}
                    <span className="fst-italic text-dark">"{formData.indicaciones}"</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TABLA DE PRODUCTOS RESUMEN */}
          <div className="table-responsive mb-4">
            <table className="table align-middle text-center border-top">
              <thead className="table-light">
                <tr>
                  <th scope="col" className="text-start">Imagen</th>
                  <th scope="col" className="text-start">Nombre</th>
                  <th scope="col">Precio</th>
                  <th scope="col">Cantidad</th>
                  <th scope="col">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {itemsAMostrar.map((it) => {
                  const p = it.productos || {};
                  const subtotal = (p.precio || 0) * it.cantidad;
                  return (
                    <tr key={it.producto_id}>
                      <td className="text-start">
                        <img
                          src={p.imagen}
                          alt={p.nombre}
                          style={{ width: '40px', height: '30px', objectFit: 'cover' }}
                          className="rounded"
                        />
                      </td>
                      <td className="text-start fw-medium">{p.nombre}</td>
                      <td>{formatoCLP(p.precio)}</td>
                      <td>{it.cantidad}</td>
                      <td>{formatoCLP(subtotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ACCIONES Y BOTONES FINALES */}
          {estadoPago === 'exito' && (
            <div>
              <div className="bg-light p-3 text-center rounded border mb-4">
                <span className="fs-5 fw-bold text-dark">
                  Total pagado: {formatoCLP(totalAMostrar)}
                </span>
              </div>

              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <button
                  type="button"
                  className="btn btn-danger px-4 py-2 small fw-semibold"
                  onClick={() => setMostrarBoleta(true)}
                >
                  Imprimir boleta en PDF
                </button>
                <button
                  type="button"
                  className="btn btn-success px-4 py-2 small fw-semibold"
                  onClick={handleEnviarBoleta}
                >
                  Enviar boleta por email
                </button>
              </div>
            </div>
          )}

          {estadoPago === 'error' && (
            <div className="bg-light p-3 text-center rounded border">
              <span className="fs-5 fw-bold text-dark">
                Total pagado: {formatoCLP(totalAMostrar)}
              </span>
            </div>
          )}

          {estadoPago === 'formulario' && (
            <div>
              <div className="form-check form-switch mb-3 d-flex justify-content-end align-items-center gap-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="switchSimularError"
                  checked={simularError}
                  onChange={(e) => setSimularError(e.target.checked)}
                />
                <label className="form-check-label text-muted small" htmlFor="switchSimularError">
                  Simular error de pago (Para evaluación)
                </label>
              </div>

              <div className="d-flex justify-content-end">
                <button type="submit" className="btn btn-success btn-lg px-4 fs-6 fw-semibold">
                  Pagar ahora {formatoCLP(total)}
                </button>
              </div>
            </div>
          )}

        </form>
      </div>

      {/* MODAL DE BOLETA ELECTRÓNICA */}
      <BoletaModal
        show={mostrarBoleta}
        onClose={() => setMostrarBoleta(false)}
        numOrden={numOrden}
        codigoOrden={codigoOrden}
        cliente={formData}
        items={itemsAMostrar}
        total={totalAMostrar}
      />
    </div>
  );
}