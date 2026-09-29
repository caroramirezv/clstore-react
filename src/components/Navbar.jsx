import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { usuario, perfil, signOut } = useAuth();

  const linkClass = ({ isActive }) => 'nav-link' + (isActive ? ' active' : '');

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm">
      <div className="container">
        <NavLink className="navbar-brand d-flex align-items-center gap-2" to="/">
          <img src="/img/Logo.png" alt="logo" height="40" />
          <span className="fw-bold">CLstore</span>
        </NavLink>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 fw-semibold">
            <li className="nav-item"><NavLink className={linkClass} to="/">Home</NavLink></li>
            <li className="nav-item"><NavLink className={linkClass} to="/productos">Productos</NavLink></li>
            <li className="nav-item"><NavLink className={linkClass} to="/nosotros">Nosotros</NavLink></li>
            <li className="nav-item"><NavLink className={linkClass} to="/blogs">Blogs</NavLink></li>
            <li className="nav-item"><NavLink className={linkClass} to="/contacto">Contacto</NavLink></li>

            {!usuario && (
              <>
                <li className="nav-item"><NavLink className={linkClass} to="/registro">Regístrate</NavLink></li>
                <li className="nav-item"><NavLink className={linkClass} to="/iniciar-sesion">Iniciar Sesión</NavLink></li>
              </>
            )}
            {usuario && (
              <>
                {(perfil?.tipo === 'Administrador' || perfil?.tipo === 'Vendedor') && (
                  <li className="nav-item"><NavLink className={linkClass} to="/admin">Admin</NavLink></li>
                )}
                <li className="nav-item">
                  <button className="nav-link btn btn-link" onClick={signOut} style={{ border: 'none' }}>
                    Salir ({perfil?.nombre || usuario.email})
                  </button>
                </li>
              </>
            )}
          </ul>
          <NavLink to="/carrito" className="btn btn-primary rounded-pill ms-lg-3 d-none d-lg-inline-block">
            <i className="fa-solid fa-cart-shopping me-1"></i> Carrito
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
