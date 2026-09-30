import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { usuario } = useAuth();
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(false);

  const cargarCarritoSupabase = useCallback(async () => {
    if (!usuario) return;
    setCargando(true);
    const { data, error } = await supabase
      .from('carrito_items')
      .select('id, producto_id, cantidad, productos ( id, nombre, precio, imagen )')
      .eq('usuario_id', usuario.id);
    if (!error) setItems(data || []);
    setCargando(false);
  }, [usuario]);

  useEffect(() => {
    if (usuario) {
      cargarCarritoSupabase();
    } else {
      setItems([]);
    }
  }, [usuario, cargarCarritoSupabase]);

  async function agregarProducto(producto) {
    if (usuario) {
      const existente = items.find((it) => it.producto_id === producto.id);
      if (existente) {
        await supabase
          .from('carrito_items')
          .update({ cantidad: existente.cantidad + 1 })
          .eq('id', existente.id);
      } else {
        await supabase.from('carrito_items').insert({
          usuario_id: usuario.id,
          producto_id: producto.id,
          cantidad: 1,
        });
      }
      await cargarCarritoSupabase();
    } else {
      setItems((prev) => {
        const existente = prev.find((it) => it.producto_id === producto.id);
        if (existente) {
          return prev.map((it) =>
            it.producto_id === producto.id ? { ...it, cantidad: it.cantidad + 1 } : it
          );
        }
        return [
          ...prev,
          {
            producto_id: producto.id,
            cantidad: 1,
            productos: { id: producto.id, nombre: producto.nombre, precio: producto.precio, imagen: producto.imagen },
          },
        ];
      });
    }

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Producto añadido',
      showConfirmButton: false,
      timer: 1500,
    });
  }

  async function cambiarCantidad(productoId, delta) {
    const item = items.find((it) => it.producto_id === productoId);
    if (!item) return;
    const nuevaCantidad = item.cantidad + delta;

    if (nuevaCantidad <= 0) {
      await eliminarProducto(productoId);
      return;
    }

    if (usuario) {
      await supabase.from('carrito_items').update({ cantidad: nuevaCantidad }).eq('id', item.id);
      await cargarCarritoSupabase();
    } else {
      setItems((prev) =>
        prev.map((it) => (it.producto_id === productoId ? { ...it, cantidad: nuevaCantidad } : it))
      );
    }
  }

  async function eliminarProducto(productoId) {
    if (usuario) {
      const item = items.find((it) => it.producto_id === productoId);
      if (item) await supabase.from('carrito_items').delete().eq('id', item.id);
      await cargarCarritoSupabase();
    } else {
      setItems((prev) => prev.filter((it) => it.producto_id !== productoId));
    }
  }

  async function vaciarCarrito() {
    if (usuario) {
      await supabase.from('carrito_items').delete().eq('usuario_id', usuario.id);
    }
    setItems([]);
  }

  const total = items.reduce((acc, it) => acc + (it.productos?.precio || 0) * it.cantidad, 0);

  const value = { items, cargando, total, agregarProducto, cambiarCantidad, eliminarProducto, vaciarCarrito };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
