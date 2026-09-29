import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setBlogs(data || []);
        setCargando(false);
      });
  }, []);

  return (
    <main className="container my-5">
      <h1 className="text-center fw-bold mb-5">Noticias y Guías</h1>

      <div className="row d-flex flex-column gap-4">
        {cargando && <p className="text-white-50 text-center">Cargando artículos...</p>}
        {!cargando && blogs.length === 0 && <p className="text-white-50 text-center">Pronto subiremos nuevos artículos.</p>}

        {blogs.map((blog) => (
          <article key={blog.id} className="card blog-card shadow-sm border-dark mb-4">
            <div className="row g-0 align-items-center h-100">
              <div className="col-md-7 p-4 d-flex flex-column justify-content-between h-100">
                <div>
                  <h2 className="fw-bold mb-3">{blog.titulo}</h2>
                  <p className="card-text text-light opacity-75">{blog.resumen}</p>
                </div>
                <div className="mt-4">
                  <Link to={`/blogs/${blog.id}`} className="btn btn-light text-dark fw-bold px-4 rounded-0 shadow-sm">
                    LEER MÁS
                  </Link>
                </div>
              </div>
              <div className="col-md-5 h-100">
                <div className="blog-img-wrapper border-start border-dark h-100">
                  <img
                    src={blog.imagen}
                    className="img-fluid w-100 h-100"
                    style={{ objectFit: 'cover', minHeight: 250 }}
                    alt={blog.titulo}
                  />
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
