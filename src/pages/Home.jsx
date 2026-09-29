import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const { perfil } = useAuth();
  const [destacados, setDestacados] = useState([]);

  useEffect(() => {
    supabase
      .from('productos')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(3)
      .then(({ data }) => setDestacados(data || []));
  }, []);

  return (
    <>
      <div className="container-fluid p-0">
        <div id="carouselHome" className="carousel slide" data-bs-ride="carousel">
          <div className="carousel-inner">
            <div className="carousel-item active">
              <img src="/img/Carrusel1.png" className="d-block w-100 carousel-banner-img" alt="Banner 1" />
            </div>
            <div className="carousel-item">
              <img src="/img/Carrusel2.png" className="d-block w-100 carousel-banner-img" alt="Banner 2" />
            </div>
            <div className="carousel-item">
              <img src="/img/Carrusel3.png" className="d-block w-100 carousel-banner-img" alt="Banner 3" />
            </div>
          </div>
          <button className="carousel-control-prev" type="button" data-bs-target="#carouselHome" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" />
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#carouselHome" data-bs-slide="next">
            <span className="carousel-control-next-icon" />
          </button>
        </div>
      </div>

      {perfil && (
        <h2 className="text-center fw-bold mt-4 mb-0">¡Bienvenido/a de nuevo, {perfil.nombre}!</h2>
      )}

      <div className="container my-5">
        <h2 className="fw-bold mb-4 text-center">Productos Destacados</h2>
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
          {destacados.map((p) => (
            <ProductCard key={p.id} producto={p} mostrarBotonAgregar={false} />
          ))}
        </div>
        <div className="text-center mt-4">
          <Link to="/productos" className="btn btn-primary rounded-pill">
            Ver catálogo completo <i className="fa-solid fa-arrow-right ms-1"></i>
          </Link>
        </div>
      </div>
    </>
  );
}
