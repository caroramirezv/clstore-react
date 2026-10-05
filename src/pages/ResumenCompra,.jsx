import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import ProductCard from '../components/ProductCard';

export default function Resumen() {

  return (
    <h1>Esta será la pagina donde se detalla informacion de la compra en caso de que esta haya sido procesada correctamente <br /> Debe decir la direccion, detalles de los productos y el valor final de la compra <br /> 
    En caso de que la compra sea exitosa o no, mostrara un mensaje en cualquiera de los casos, dejando volver al home para seguir comprando o intentar nuevamente la compra </h1>
);
}