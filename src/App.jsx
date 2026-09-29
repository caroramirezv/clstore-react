import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Productos from './pages/Productos';
import DetalleProducto from './pages/DetalleProducto';
import Carrito from './pages/Carrito';
import Contacto from './pages/Contacto';
import Nosotros from './pages/Nosotros';
import Blogs from './pages/Blogs';
import BlogDetalle from './pages/BlogDetalle';
import Registro from './pages/Registro';
import InicioSesion from './pages/InicioSesion';
import AdminLayout from './pages/Admin/AdminLayout';

function Layout({ children }) {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="flex-grow-1">{children}</div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>} />
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/productos" element={<Productos />} />
                <Route path="/productos/:id" element={<DetalleProducto />} />
                <Route path="/carrito" element={<Carrito />} />
                <Route path="/contacto" element={<Contacto />} />
                <Route path="/nosotros" element={<Nosotros />} />
                <Route path="/blogs" element={<Blogs />} />
                <Route path="/blogs/:id" element={<BlogDetalle />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/iniciar-sesion" element={<InicioSesion />} />
                <Route path="*" element={<Home />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}
