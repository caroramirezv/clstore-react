import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import AdminOrdenes from './AdminOrdenes';
import AdminProductos from './AdminProductos';
import AdminCategorias from './AdminCategorias';
import AdminUsuarios from './AdminUsuarios';

const SECCIONES = [
  { id: 'dashboard', etiqueta: 'Dashboard', icono: 'fa-gauge-high' },
  { id: 'ordenes', etiqueta: 'Órdenes', icono: 'fa-receipt' },
  { id: 'productos', etiqueta: 'Productos', icono: 'fa-boxes-stacked' },
  { id: 'categorias', etiqueta: 'Categorías', icono: 'fa-layer-group' },
  { id: 'usuarios', etiqueta: 'Usuarios', icono: 'fa-users', soloAdmin: true },
];

export default function AdminLayout() {
  const { perfil, signOut } = useAuth();
  const [seccion, setSeccion] = useState('dashboard');
  const esVendedor = perfil?.tipo === 'Vendedor';

  const seccionesVisibles = SECCIONES.filter((s) => !(s.soloAdmin && esVendedor));

  return (
    <>
      <nav className="navbar navbar-expand-lg sticky-top admin-navbar bg-white border-bottom">
        <div className="container-fluid">
          <a className="navbar-brand d-flex align-items-center gap-2 m-0" href="#">
            <div className="brand-logo"><i className="fa-solid fa-compass fs-5"></i></div>
            <span className="fw-bold text-dark fs-5">Clstore</span>
          </a>
          <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarAdminContent">
            <i className="fa-solid fa-bars fs-4 text-dark"></i>
          </button>
          <div className="collapse navbar-collapse mt-3 mt-lg-0" id="navbarAdminContent">
            <ul className="navbar-nav mx-lg-auto mb-3 mb-lg-0 nav-pills-custom gap-1">
              {seccionesVisibles.map((s) => (
                <li className="nav-item" key={s.id}>
                  <a
                    className={`nav-link ${seccion === s.id ? 'active' : ''}`}
                    href="#"
                    onClick={(e) => { e.preventDefault(); setSeccion(s.id); }}
                  >
                    <i className={`fa-solid ${s.icono} me-2`}></i>{s.etiqueta}
                  </a>
                </li>
              ))}
            </ul>
            <div className="d-flex align-items-center gap-3">
              <Link to="/" className="btn btn-exit btn-sm rounded-pill px-3 py-2">
                <i className="fa-solid fa-right-from-bracket me-1"></i> Salir a Tienda
              </Link>
              <div className="vr d-none d-lg-block text-muted opacity-25" style={{ height: 24 }}></div>
              <div className="profile-pill d-flex align-items-center gap-2">
                <div className="profile-avatar"><i className="fa-solid fa-user"></i></div>
                <span className="fw-semibold text-secondary small">
                  {perfil ? `${perfil.nombre} · ${perfil.tipo}` : 'Cargando...'}
                </span>
              </div>
              <button className="btn btn-sm btn-outline-danger rounded-pill" onClick={signOut}>Salir</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="content-body">
        {seccion === 'dashboard' && <AdminDashboard />}
        {seccion === 'ordenes' && <AdminOrdenes />}
        {seccion === 'productos' && <AdminProductos />}
        {seccion === 'categorias' && <AdminCategorias />}
        {seccion === 'usuarios' && !esVendedor && <AdminUsuarios />}
      </div>
    </>
  );
}
