import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-dark text-white py-4 mt-auto">
      <div className="container text-center">
        <p className="mb-1">© 2026 CLstore. Todos los derechos reservados.</p>
        <Link to="/contacto" className="text-white-50 text-decoration-none">Contacto</Link>
      </div>
    </footer>
  );
}
