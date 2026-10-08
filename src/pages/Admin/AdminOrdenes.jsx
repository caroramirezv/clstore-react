import { Fragment, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { formatoCLP } from '../../lib/validaciones';

export default function AdminOrdenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [expandida, setExpandida] = useState(null);
  const [itemsPorOrden, setItemsPorOrden] = useState({});

  useEffect(() => {
    supabase
      .from('ordenes')
      .select('*')
      .order('creado_en', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setOrdenes(data || []);
        setCargando(false);
      });
  }, []);

  async function alternarDetalle(ordenId) {
    if (expandida === ordenId) {
      setExpandida(null);
      return;
    }
    setExpandida(ordenId);
    if (!itemsPorOrden[ordenId]) {
      const { data } = await supabase.from('orden_items').select('*').eq('orden_id', ordenId);
      setItemsPorOrden((prev) => ({ ...prev, [ordenId]: data || [] }));
    }
  }

  return (
    <section className="p-4">
      <h4 className="fw-bold mb-4"><i className="fa-solid fa-receipt me-2"></i>Historial de Órdenes</h4>

      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th>#</th><th>Fecha</th><th>Comprador</th><th>Comuna</th><th>Total</th><th>Estado</th>
                  <th className="text-end pe-4">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {cargando && <tr><td colSpan={7} className="text-center text-muted py-4">Cargando...</td></tr>}
                {!cargando && ordenes.length === 0 && (
                  <tr><td colSpan={7} className="text-center text-muted py-4">Todavía no hay órdenes registradas.</td></tr>
                )}
                {ordenes.map((o) => (
                  <Fragment key={o.id}>
                    <tr>
                      <td className="text-muted">#{o.id}</td>
                      <td>{new Date(o.creado_en).toLocaleString('es-CL')}</td>
                      <td className="fw-semibold">{o.nombre_comprador} {o.apellidos_comprador}</td>
                      <td>{o.comuna}</td>
                      <td>{formatoCLP(o.total)}</td>
                      <td>
                        <span className={`badge ${o.estado === 'exitosa' ? 'bg-success' : 'bg-danger'}`}>
                          {o.estado === 'exitosa' ? 'Exitosa' : 'Fallida'}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <button className="btn btn-sm btn-outline-secondary rounded-pill" onClick={() => alternarDetalle(o.id)}>
                          {expandida === o.id ? 'Ocultar' : 'Ver'}
                        </button>
                      </td>
                    </tr>
                    {expandida === o.id && (
                      <tr>
                        <td colSpan={7} className="bg-light">
                          <div className="p-3">
                            <p className="small text-muted mb-2">{o.correo_comprador} · {o.direccion}, {o.comuna}, {o.region}</p>
                            <table className="table table-sm mb-0">
                              <thead>
                                <tr><th>Producto</th><th>Cantidad</th><th>Precio unitario</th><th>Subtotal</th></tr>
                              </thead>
                              <tbody>
                                {(itemsPorOrden[o.id] || []).map((it) => (
                                  <tr key={it.id}>
                                    <td>{it.nombre_producto}</td>
                                    <td>{it.cantidad}</td>
                                    <td>{formatoCLP(it.precio_unitario)}</td>
                                    <td>{formatoCLP(it.precio_unitario * it.cantidad)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
