import { Link } from 'react-router-dom';
import { formatoCLP } from '../test/validaciones';
import { useCart } from '../context/CartContext';

export default function ProductCard({ producto, mostrarBotonAgregar = true }) {
  const { agregarProducto } = useCart();

  return (
    <div className="col">
      <div className="card h-100 card-product shadow-sm">
        <img src={producto.imagen} className="card-img-top" alt={producto.nombre} />
        <div className="card-body d-flex flex-column justify-content-between">
          <div>
            <h5 className="card-title fw-bold">{producto.nombre}</h5>
            <p className="card-text fs-4 fw-bold text-primary">{formatoCLP(producto.precio)}</p>
          </div>
          <div className="d-grid gap-2 mt-3">
            <Link to={`/productos/${producto.id}`} className="btn btn-outline-secondary rounded-pill">
              Más Información
            </Link>
            {mostrarBotonAgregar && (
              <button className="btn btn-primary rounded-pill w-100" onClick={() => agregarProducto(producto)}>
                <i className="fa-solid fa-cart-plus me-1"></i> Agregar al Carrito
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
