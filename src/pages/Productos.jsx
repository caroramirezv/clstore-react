import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import ProductCard from '../components/ProductCard';

const FILTROS = [
  { valor: 'all', etiqueta: 'Todos' },
  { valor: 'componentes', etiqueta: 'Componentes' },
  { valor: 'consolas', etiqueta: 'Consolas & Laptops' },
  { valor: 'perifericos', etiqueta: 'Periféricos & Monitores' },
];

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('all');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    supabase
      .from('productos')
      .select('*')
      .then(({ data, error }) => {
        if (!error) setProductos(data || []);
        setCargando(false);
      });
  }, []);

  const filtrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();
    return productos.filter((p) => {
      const coincideCategoria = filtro === 'all' || p.categoria === filtro;
      const coincideBusqueda =
        (p.nombre || '').toLowerCase().includes(texto) || (p.busqueda || '').toLowerCase().includes(texto);
      return coincideCategoria && coincideBusqueda;
    });
  }, [productos, busqueda, filtro]);

  return (
    <div className="container my-5">
      <div className="row align-items-center mb-4 g-3">
        <div className="col-md-6">
          <h2 className="fw-bold m-0"><i className="fa-solid fa-boxes-stacked me-2"></i>Todos los productos</h2>
        </div>
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <i className="fa-solid fa-magnifying-glass text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="d-flex gap-2 overflow-auto pb-3 mb-4">
        {FILTROS.map((f) => (
          <button
            key={f.valor}
            className={`btn rounded-pill btn-filter ${filtro === f.valor ? 'btn-primary active' : 'btn-outline-secondary'}`}
            onClick={() => setFiltro(f.valor)}
          >
            {f.etiqueta}
          </button>
        ))}
      </div>

      <div className="row row-cols-1 row-cols-md-3 g-4">
        {cargando && <p className="text-center text-muted col-12 my-4">Cargando productos...</p>}
        {!cargando && filtrados.length === 0 && (
          <p className="text-center text-muted col-12 my-4">No se encontraron productos.</p>
        )}
        {filtrados.map((p) => (
          <ProductCard key={p.id} producto={p} />
        ))}
      </div>
    </div>
  );
}
