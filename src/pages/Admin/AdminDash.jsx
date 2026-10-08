import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { supabase } from '../../lib/supabaseClient';
import { formatoCLP } from '../../lib/validaciones';

const CATEGORIA_LABELS = {
  componentes: 'Componentes',
  consolas: 'Consolas',
  perifericos: 'Periféricos',
};

export default function AdminDashboard() {
  const [cargando, setCargando] = useState(true);
  const [stats, setStats] = useState({
    ventasTotales: 0,
    cantidadOrdenes: 0,
    cantidadProductos: 0,
    unidadesEnStock: 0,
    cantidadUsuarios: 0,
    productosStockCritico: 0,
    ventasPorCategoria: [],
  });

  useEffect(() => {
    async function cargar() {
      const [ordenesRes, productosRes, usuariosRes] = await Promise.all([
        supabase.from('ordenes').select('total, estado').eq('estado', 'exitosa'),
        supabase.from('productos').select('stock, stock_critico, categoria'),
        supabase.from('perfiles').select('id', { count: 'exact', head: true }),
      ]);

      const ordenes = ordenesRes.data || [];
      const productos = productosRes.data || [];

      const ventasTotales = ordenes.reduce((acc, o) => acc + Number(o.total || 0), 0);
      const unidadesEnStock = productos.reduce((acc, p) => acc + Number(p.stock || 0), 0);
      const productosStockCritico = productos.filter((p) => p.stock_critico != null && p.stock <= p.stock_critico).length;

      const porCategoria = {};
      productos.forEach((p) => {
        porCategoria[p.categoria] = (porCategoria[p.categoria] || 0) + Number(p.stock || 0);
      });
      const ventasPorCategoria = Object.entries(porCategoria).map(([categoria, stock]) => ({
        categoria: CATEGORIA_LABELS[categoria] || categoria,
        stock,
      }));

      setStats({
        ventasTotales,
        cantidadOrdenes: ordenes.length,
        cantidadProductos: productos.length,
        unidadesEnStock,
        cantidadUsuarios: usuariosRes.count || 0,
        productosStockCritico,
        ventasPorCategoria,
      });
      setCargando(false);
    }
    cargar();
  }, []);

  if (cargando) return <div className="p-4 text-center text-muted">Cargando dashboard...</div>;

  return (
    <section className="p-4">
      <h4 className="fw-bold mb-4"><i className="fa-solid fa-gauge-high me-2"></i>Dashboard</h4>
      <p className="text-muted mb-4">Resumen de las actividades de la tienda.</p>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="p-4 rounded-4 text-white shadow-sm" style={{ backgroundColor: '#0d6efd' }}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="fa-solid fa-sack-dollar fs-4"></i>
              <span className="fw-semibold">Ventas Totales</span>
            </div>
            <div className="fs-3 fw-bold">{formatoCLP(stats.ventasTotales)}</div>
            <div className="small opacity-75">{stats.cantidadOrdenes} órdenes pagadas</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-4 rounded-4 text-white shadow-sm" style={{ backgroundColor: '#198754' }}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="fa-solid fa-box fs-4"></i>
              <span className="fw-semibold">Productos</span>
            </div>
            <div className="fs-3 fw-bold">{stats.cantidadProductos}</div>
            <div className="small opacity-75">{stats.unidadesEnStock} unidades en inventario</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-4 rounded-4 text-dark shadow-sm" style={{ backgroundColor: '#ffc107' }}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="fa-solid fa-users fs-4"></i>
              <span className="fw-semibold">Usuarios</span>
            </div>
            <div className="fs-3 fw-bold">{stats.cantidadUsuarios}</div>
            <div className="small opacity-75">cuentas registradas</div>
          </div>
        </div>
      </div>

      {stats.productosStockCritico > 0 && (
        <div className="alert alert-warning">
          <i className="fa-solid fa-triangle-exclamation me-2"></i>
          {stats.productosStockCritico} producto(s) con stock en nivel crítico. Revisa el mantenedor de Productos.
        </div>
      )}

      <div className="card border-0 shadow-sm rounded-4 p-4">
        <h6 className="fw-bold mb-3">Unidades en stock por categoría</h6>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={stats.ventasPorCategoria}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="categoria" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="stock" fill="#0d6efd" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
