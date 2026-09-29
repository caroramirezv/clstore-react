import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { usuario, perfil, loading, esAdminOVendedor } = useAuth();

  if (loading) return <div className="container my-5 text-center">Cargando...</div>;
  if (!usuario) return <Navigate to="/iniciar-sesion" replace />;
  if (!esAdminOVendedor) return <Navigate to="/" replace />;

  return children;
}
