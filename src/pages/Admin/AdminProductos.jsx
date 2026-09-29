import { useEffect, useState } from 'react';
import { Modal } from 'bootstrap';
import Swal from 'sweetalert2';
import { supabase } from '../../lib/supabaseClient';
import { formatoCLP } from '../../lib/validaciones';

const CATEGORIA_LABELS = {
  componentes: 'Componentes',
  consolas: 'Consolas & Laptops',
  perifericos: 'Periféricos & Monitores',
};

const formVacio = {
  id: '', nombre: '', descripcion: '', precio: '', stock: '', stockCritico: '', categoria: '', imagen: '',
};

export default function AdminProductos() {
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState(formVacio);
  const [esEdicion, setEsEdicion] = useState(false);

  async function cargarProductos() {
    const { data } = await supabase.from('productos').select('*').order('nombre');
    setProductos(data || []);
  }

  useEffect(() => {
    cargarProductos();
  }, []);

  function abrirCreacion() {
    setForm(formVacio);
    setEsEdicion(false);
  }

  function abrirEdicion(p) {
    setForm({
      id: p.id,
      nombre: p.nombre || '',
      descripcion: p.descripcion || '',
      precio: p.precio ?? '',
      stock: p.stock ?? '',
      stockCritico: p.stock_critico ?? '',
      categoria: p.categoria || '',
      imagen: p.imagen || '',
    });
    setEsEdicion(true);
  }

  function cerrarModal() {
    Modal.getInstance(document.getElementById('modalProducto'))?.hide();
  }

  async function guardar(e) {
    e.preventDefault();

    const precio = parseFloat(form.precio);
    const stock = parseInt(form.stock, 10);
    const stockCritico = form.stockCritico === '' ? null : parseInt(form.stockCritico, 10);

    if (form.id.length < 3) {
      Swal.fire('Código inválido', 'El código del producto debe tener al menos 3 caracteres.', 'error');
      return;
    }
    if (!form.nombre || Number.isNaN(precio) || precio < 0 || Number.isNaN(stock) || stock < 0 || !form.categoria) {
      Swal.fire('Datos incompletos', 'Revisa que nombre, precio, stock y categoría estén completos.', 'error');
      return;
    }

    if (esEdicion) {
      const { error } = await supabase
        .from('productos')
        .update({
          nombre: form.nombre, descripcion: form.descripcion, precio, stock,
          stock_critico: stockCritico, categoria: form.categoria,
          imagen: form.imagen || 'img/Logo.png', busqueda: form.nombre.toLowerCase(),
        })
        .eq('id', form.id);
      if (error) { Swal.fire('Error', error.message, 'error'); return; }
    } else {
      const { data: existente } = await supabase.from('productos').select('id').eq('id', form.id).maybeSingle();
      if (existente) { Swal.fire('Código repetido', 'Ya existe un producto con ese código.', 'error'); return; }

      const { error } = await supabase.from('productos').insert({
        id: form.id, nombre: form.nombre, descripcion: form.descripcion, precio, stock,
        stock_critico: stockCritico, categoria: form.categoria,
        imagen: form.imagen || 'img/Logo.png', busqueda: form.nombre.toLowerCase(),
      });
      if (error) { Swal.fire('Error', error.message, 'error'); return; }
    }

    await cargarProductos();
    cerrarModal();
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: esEdicion ? 'Producto actualizado' : 'Producto creado', showConfirmButton: false, timer: 1500 });
  }

  async function eliminar(id) {
    const resultado = await Swal.fire({
      title: '¿Eliminar producto?', text: 'Esta acción no se puede deshacer.', icon: 'warning',
      showCancelButton: true, confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar', confirmButtonColor: '#800000',
    });
    if (!resultado.isConfirmed) return;

    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (error) { Swal.fire('Error', error.message, 'error'); return; }
    await cargarProductos();
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Producto eliminado', showConfirmButton: false, timer: 1500 });
  }

  return (
    <section className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold m-0"><i className="fa-solid fa-boxes-stacked me-2"></i>Mantenedor de Productos</h4>
        <button className="btn btn-primary rounded-pill px-4" data-bs-toggle="modal" data-bs-target="#modalProducto" onClick={abrirCreacion}>
          <i className="fa-solid fa-plus me-2"></i>Nuevo Producto
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Imagen</th><th>Código</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th>
                  <th className="text-end pe-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.length === 0 && (
                  <tr><td colSpan={7} className="text-center text-muted py-4">No hay productos guardados todavía.</td></tr>
                )}
                {productos.map((p) => (
                  <tr key={p.id}>
                    <td><img src={p.imagen || '/img/Logo.png'} alt={p.nombre} style={{ width: 48, height: 48, objectFit: 'cover' }} className="rounded" /></td>
                    <td className="text-muted">{p.id}</td>
                    <td className="fw-semibold">{p.nombre}</td>
                    <td><span className="badge bg-secondary">{CATEGORIA_LABELS[p.categoria] || p.categoria}</span></td>
                    <td>{formatoCLP(p.precio)}</td>
                    <td>
                      {p.stock ?? 0}
                      {p.stock_critico != null && p.stock <= p.stock_critico && (
                        <span className="badge bg-danger ms-1">Stock bajo</span>
                      )}
                    </td>
                    <td className="text-end pe-4">
                      <button className="btn btn-sm btn-outline-primary rounded-pill me-1" data-bs-toggle="modal" data-bs-target="#modalProducto" onClick={() => abrirEdicion(p)}>
                        <i className="fa-solid fa-pen"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => eliminar(p.id)}>
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="modal fade" id="modalProducto" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title fw-bold">{esEdicion ? 'Editar Producto' : 'Nuevo Producto'}</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form onSubmit={guardar}>
              <div className="modal-body row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Código producto *</label>
                  <input type="text" className="form-control" minLength={3} required disabled={esEdicion}
                    placeholder="Ej: PROD001 (Min 3 caracteres)"
                    value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value.trim() })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Nombre *</label>
                  <input type="text" className="form-control" maxLength={100} required
                    value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Descripción (Opcional)</label>
                  <textarea className="form-control" rows={2} maxLength={500}
                    value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Precio ($) *</label>
                  <input type="number" step="0.01" min="0" className="form-control" required
                    value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Stock *</label>
                  <input type="number" step="1" min="0" className="form-control" required
                    value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Stock Crítico (Opcional)</label>
                  <input type="number" step="1" min="0" className="form-control"
                    value={form.stockCritico} onChange={(e) => setForm({ ...form, stockCritico: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Categoría *</label>
                  <select className="form-select" required value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
                    <option value="">Seleccione Categoría</option>
                    <option value="componentes">Componentes</option>
                    <option value="consolas">Consolas & Laptops</option>
                    <option value="perifericos">Periféricos & Monitores</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Ruta Imagen (Opcional)</label>
                  <input type="text" className="form-control" placeholder="/img/ejemplo.jpg"
                    value={form.imagen} onChange={(e) => setForm({ ...form, imagen: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary rounded-pill" data-bs-dismiss="modal">Cancelar</button>
                <button type="submit" className="btn btn-primary rounded-pill">Guardar Producto</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
