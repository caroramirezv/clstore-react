import { useEffect, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { formatoCLP } from '../lib/validaciones';

export default function ResumenCompra() {
  const location = useLocation();
  const { ordenId } = useParams();
  const { usuario } = useAuth();
  const [datos, setDatos] = useState(location.state || null);
  const [cargando, setCargando] = useState(!location.state && !!ordenId);

  useEffect(() => {
    if (location.state || !ordenId) return;

    async function recargar() {
      if (!usuario) {
        setCargando(false);
        return;
      }
      const { data: orden } = await supabase.from('ordenes').select('*').eq('id', ordenId).single();
      if (!orden) {
        setCargando(false);
        return;
      }
      const { data: itemsOrden } = await supabase.from('orden_items').select('*').eq('orden_id', ordenId);
      setDatos({
        exito: orden.estado === 'exitosa',
        ordenId: orden.id,
        total: orden.total,
        items: (itemsOrden || []).map((it) => ({ nombre: it.nombre_producto, cantidad: it.cantidad, precio: it.precio_unitario })),
        comprador: {
          nombre: orden.nombre_comprador, apellidos: orden.apellidos_comprador, correo: orden.correo_comprador,
          region: orden.region, comuna: orden.comuna, direccion: orden.direccion,
        },
      });
      setCargando(false);
    }
    recargar();
  }, [ordenId, usuario, location.state]);

  if (cargando) return <div className="container my-5 text-center">Cargando resumen...</div>;

  if (!datos) {
    return (
      <div className="container my-5 text-center">
        <p className="fs-5 text-muted">No encontramos información de esta compra (¿recargaste la página?).</p>
        <Link to="/" className="btn btn-primary rounded-pill">Volver al inicio</Link>
      </div>
    );
  }

  const { exito, total, items, comprador, motivo } = datos;

  return (
    <div className="container my-5" style={{ maxWidth: 720 }}>
      <div className={`alert ${exito ? 'alert-success' : 'alert-danger'} text-center fs-5 fw-bold py-3`}>
        {exito ? (
          <><i className="fa-solid fa-circle-check me-2"></i>¡Pago exitoso! Tu pedido fue confirmado.</>
        ) : (
          <><i className="fa-solid fa-circle-xmark me-2"></i>No se pudo procesar el pago.</>
        )}
      </div>

      {!exito && (
        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
          <p className="mb-2 fw-semibold">Motivo:</p>
          <p className="text-danger mb-3">{motivo || 'Ocurrió un error inesperado.'}</p>
          <p className="text-muted small mb-3">
            No se te realizó ningún cargo y tu carrito sigue intacto: puedes ajustar las cantidades y volver a intentarlo.
          </p>
          <Link to="/carrito" className="btn btn-primary rounded-pill">Volver al carrito</Link>
        </div>
      )}

      {exito && (
        <div className="card border-0 shadow-sm rounded-4 p-4">
          {datos.ordenId && <p className="text-muted small mb-3">Número de pedido: #{datos.ordenId}</p>}

          <h5 className="fw-bold mb-3">Productos</h5>
          {(items || []).map((it, i) => (
            <div key={i} className="d-flex justify-content-between mb-2">
              <span>{it.nombre} <span className="text-muted">x{it.cantidad}</span></span>
              <span className="fw-semibold">{formatoCLP(it.precio * it.cantidad)}</span>
            </div>
          ))}
          <hr />
          <div className="d-flex justify-content-between fs-5 mb-4">
            <span className="fw-bold">Total pagado:</span>
            <span className="fw-bold text-primary">{formatoCLP(total)}</span>
          </div>

          {comprador && (
            <>
              <h5 className="fw-bold mb-3">Datos de envío</h5>
              <p className="mb-1">{comprador.nombre} {comprador.apellidos}</p>
              <p className="mb-1 text-muted">{comprador.correo}</p>
              <p className="mb-0 text-muted">{comprador.direccion}, {comprador.comuna}, {comprador.region}</p>
            </>
          )}

          <Link to="/productos" className="btn btn-outline-primary rounded-pill mt-4">Seguir comprando</Link>
        </div>
      )}
    </div>
  );
}
