import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { formatoCLP } from '../../lib/validaciones';

const CATEGORIAS = [
  { valor: 'componentes', etiqueta: 'Componentes', icono: 'fa-microchip' },
  { valor: 'consolas', etiqueta: 'Consolas & Laptops', icono: 'fa-gamepad' },
  { valor: 'perifericos', etiqueta: 'Periféricos & Monitores', icono: 'fa-keyboard' },
];

export default function AdminCategorias() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    supabase
      .from('productos')
      .select('*')
      .order('nombre')
      .then(({ data, error }) => {
        if (!error) setProductos(data || []);
        setCargando(false);
      });
  }, []);

  if (cargando) return <div className="p-4 text-center text-muted">Cargando categorías...</div>;

  return (
    <section className="p-4">
      <h4 className="fw-bold mb-4"><i className="fa-solid fa-layer-group me-2"></i>Categorías</h4>
      <p className="text-muted mb-4">
        Las categorías están definidas como un campo de cada producto; aquí se agrupan para que sea más fácil revisarlas.
      </p>

      {CATEGORIAS.map((cat) => {
        const productosDeCategoria = productos.filter((p) => p.categoria === cat.valor);
        return (
          <div key={cat.valor} className="card border-0 shadow-sm rounded-3 mb-4">
            <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
              <span className="fw-bold">
                <i className={`fa-solid ${cat.icono} me-2 text-primary`}></i>{cat.etiqueta}
              </span>
              <span className="badge bg-secondary">{productosDeCategoria.length} producto(s)</span>
            </div>
            <div className="card-body p-0">
              {productosDeCategoria.length === 0 ? (
                <p className="text-muted text-center py-3 mb-0">Sin productos en esta categoría.</p>
              ) : (
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr><th>Imagen</th><th>Nombre</th><th>Precio</th><th>Stock</th></tr>
                  </thead>
                  <tbody>
                    {productosDeCategoria.map((p) => (
                      <tr key={p.id}>
                        <td><img src={p.imagen || '/img/Logo.png'} alt={p.nombre} style={{ width: 40, height: 40, objectFit: 'cover' }} className="rounded" /></td>
                        <td>{p.nombre}</td>
                        <td>{formatoCLP(p.precio)}</td>
                        <td>{p.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}
