import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { formatoCLP } from '../lib/validaciones';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

export default function DetalleProducto() {
  const { id } = useParams();
  const { agregarProducto } = useCart();
  const [producto, setProducto] = useState(null);
  const [resenas, setResenas] = useState([]);
  const [relacionados, setRelacionados] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    setCargando(true);

    async function cargar() {
      const { data: prod } = await supabase.from('productos').select('*').eq('id', id).single();
      if (!activo) return;
      setProducto(prod || null);

      if (prod) {
        const { data: rese } = await supabase
          .from('resenas')
          .select('*')
          .eq('producto_id', prod.id)
          .order('fecha', { ascending: false });
        if (activo) setResenas(rese || []);

        const { data: relac } = await supabase
          .from('productos')
          .select('*')
          .eq('categoria', prod.categoria)
          .neq('id', prod.id)
          .limit(3);
        if (activo) setRelacionados(relac || []);
      }
      if (activo) setCargando(false);
    }
    cargar();
    return () => {
      activo = false;
    };
  }, [id]);

  if (cargando) return <div className="container my-5 text-center">Cargando producto...</div>;
  if (!producto) return <div className="container my-5 text-center">Producto no encontrado.</div>;

  const destacado = producto.destacado || {
    titulo: 'Calidad Garantizada',
    texto: 'Este producto cumple con los más altos estándares de calidad.',
  };
  const specs = producto.especificaciones || {};

  return (
    <div className="container my-5">
      <div className="row g-4">
        <div className="col-md-5">
          <div className="border rounded p-3 shadow-sm bg-white">
            <img
              src={producto.imagen}
              alt={producto.nombre}
              className="d-block w-100 rounded"
              style={{ maxHeight: 380, objectFit: 'contain' }}
            />
          </div>
        </div>

        <div
          className="col-md-7"
          style={{
            fontFamily: "'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif",
            backgroundColor: 'rgba(255,255,255,0.05)',
            padding: 20,
            borderRadius: 10,
          }}
        >
          <h2 className="fw-bold">
            {producto.nombre} <span className="text-primary ms-2">{formatoCLP(producto.precio)}</span>
          </h2>
          <p className="text-secondary fw-semibold fs-5">
            {producto.descripcion ||
              `Disfruta del máximo rendimiento con tu ${producto.nombre}. Diseñado para ofrecer durabilidad y alta eficiencia en cada tarea.`}
          </p>

          <div
            className="border rounded p-3 shadow-sm mb-4"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <ul className="list-group list-group-flush mb-0">
              {Object.keys(specs).length === 0 && (
                <li className="list-group-item bg-transparent border-0 text-muted text-center py-3">
                  Especificaciones no disponibles
                </li>
              )}
              {Object.entries(specs).map(([propiedad, valor]) => (
                <li
                  key={propiedad}
                  className="list-group-item bg-transparent text-white border-secondary d-flex justify-content-between align-items-center py-2 px-0"
                >
                  <span className="text-white-50 fw-bold">{propiedad}</span>
                  <span className="text-end text-light">{valor}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            className="btn fw-bold w-100 d-flex align-items-center justify-content-center"
            style={{ height: 70, backgroundColor: 'rgb(85,205,58)', color: 'rgb(49,49,49)', border: 'none' }}
            onClick={() => agregarProducto(producto)}
          >
            Agregar al carrito
          </button>
        </div>
      </div>

      <div className="row mt-5 pt-5 g-4">
        <div className="col-lg-8">
          <h3 className="fw-bold mb-4">Reseñas</h3>
          {resenas.length === 0 && (
            <div className="alert alert-dark text-white-50" role="alert">
              Este producto aún no tiene reseñas. ¡Sé el primero en opinar!
            </div>
          )}
          {resenas.map((res) => (
            <div key={res.id} className="card bg-dark text-white border-secondary mb-3 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="fw-bold mb-0 text-primary">{res.usuario}</h6>
                  <small className="text-white-50">{res.fecha}</small>
                </div>
                <div className="mb-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <i
                      key={i}
                      className={i <= res.calificacion ? 'fa-solid fa-star text-warning' : 'fa-regular fa-star text-secondary'}
                    />
                  ))}
                </div>
                <p className="card-text text-light mb-0">{res.comentario}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="col-lg-4">
          <div
            className="rounded-4 p-4 h-100 shadow-sm d-flex flex-column justify-content-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <h4 className="fw-bold mb-3" style={{ color: '#76b900' }}>{destacado.titulo}</h4>
            <p style={{ fontSize: 15, color: '#e0e0e0', lineHeight: 1.6 }}>{destacado.texto}</p>
          </div>
        </div>
      </div>

      <div className="row mt-5 pt-4 g-4">
        <div className="col-12">
          <h3 className="fw-bold mb-4">Productos relacionados</h3>
        </div>
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
          {relacionados.length === 0 && <p className="text-muted col-12">No hay otros productos en esta categoría.</p>}
          {relacionados.map((rel) => (
            <ProductCard key={rel.id} producto={rel} mostrarBotonAgregar={false} />
          ))}
        </div>
      </div>
    </div>
  );
}
