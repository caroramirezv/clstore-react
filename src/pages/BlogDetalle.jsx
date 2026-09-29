import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function BlogDetalle() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setCargando(true);
    supabase
      .from('blogs')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setBlog(data || null);
        setCargando(false);
        if (data) document.title = `${data.titulo} - CLstore Blogs`;
      });
  }, [id]);

  if (cargando) return <div className="container my-5 text-center">Cargando artículo...</div>;
  if (!blog) return <div className="container my-5 text-center text-danger">Artículo no encontrado.</div>;

  return (
    <main className="container my-5" style={{ maxWidth: 800 }}>
      <Link to="/blogs" className="btn btn-outline-secondary rounded-pill mb-4">
        <i className="fa-solid fa-arrow-left me-1"></i> Volver a Blogs
      </Link>

      <h1 className="fw-bold mb-4">{blog.titulo}</h1>

      <img
        src={blog.imagen}
        alt={blog.titulo}
        className="img-fluid w-100 rounded mb-4"
        style={{ maxHeight: 420, objectFit: 'cover' }}
      />

      <div className="fs-5" style={{ lineHeight: 1.7 }}>
        {(blog.contenido || []).map((parrafo, i) => (
          <p key={i} style={{ lineHeight: 1.8, marginBottom: '1.5rem', color: '#e0e0e0' }}>
            {parrafo}
          </p>
        ))}
      </div>

      {blog.fuente_url && (
        <a href={blog.fuente_url} target="_blank" rel="noopener noreferrer" className="d-inline-block mt-4 text-decoration-none">
          Escrito por: {blog.fuente_nombre || 'Equipo CLstore'}
        </a>
      )}
    </main>
  );
}
