import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatoCLP } from '../lib/validaciones';

export default function Carrito() {
  const { items, total, cambiarCantidad, eliminarProducto } = useCart();
  const { usuario } = useAuth();
  const navigate = useNavigate();

  // Función para ir al Checkout
  const irAlCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="container my-5">
      <h2 className="fw-bold mb-4">
        <i className="fa-solid fa-cart-shopping me-2"></i>Tu Carrito
      </h2>

      {!usuario && (
        <div className="alert alert-warning">
          Estás comprando como invitado: este carrito no se guardará si cierras la pestaña.{' '}
          <Link to="/iniciar-sesion">Inicia sesión</Link> para que tu carrito se guarde en tu cuenta.
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card cart-card border-0 shadow-sm rounded-4 p-3">
            {items.length > 0 ? (
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Precio</th>
                      <th style={{ width: 150 }}>Cantidad</th>
                      <th>Subtotal</th>
                      <th className="text-end">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it) => {
                      const p = it.productos || {};
                      const subtotal = (p.precio || 0) * it.cantidad;
                      return (
                        <tr key={it.producto_id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <img src={p.imagen} className="cart-item-thumb" alt={p.nombre} />
                              <span className="cart-item-name ms-2">{p.nombre}</span>
                            </div>
                          </td>
                          <td className="cart-item-price">{formatoCLP(p.precio)}</td>
                          <td>
                            <div className="qty-control">
                              <button className="qty-btn" onClick={() => cambiarCantidad(it.producto_id, -1)}>
                                <i className="fa-solid fa-minus"></i>
                              </button>
                              <span className="qty-value">{it.cantidad}</span>
                              <button className="qty-btn" onClick={() => cambiarCantidad(it.producto_id, 1)}>
                                <i className="fa-solid fa-plus"></i>
                              </button>
                            </div>
                          </td>
                          <td className="cart-item-subtotal">{formatoCLP(subtotal)}</td>
                          <td className="text-end">
                            <button className="btn-remove-item" onClick={() => eliminarProducto(it.producto_id)}>
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="fa-solid fa-cart-flatbed-suitcases fa-3x text-muted mb-3"></i>
                <p className="fs-5 text-muted">Tu carrito está vacío.</p>
                <Link to="/productos" className="btn btn-primary rounded-pill">Ver Productos</Link>
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card card-summary shadow-sm rounded-4 p-4">
            <h5 className="fw-bold mb-4">Resumen del Pedido</h5>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Subtotal:</span>
              <span className="fw-semibold">{formatoCLP(total)}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Envío:</span>
              <span className="text-success fw-semibold">Gratis</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between mb-4 fs-5">
              <span className="fw-bold">Total:</span>
              <span className="fw-bold text-primary">{formatoCLP(total)}</span>
            </div>
            
            {/* BOTÓN QUE REDIRIGE AL CHECKOUT */}
            <button
              className="btn btn-primary rounded-pill w-100 py-2 fw-bold"
              disabled={items.length === 0}
              onClick={irAlCheckout}
            >
              Proceder al Pago
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
