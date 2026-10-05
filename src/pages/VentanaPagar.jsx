import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import ProductCard from '../components/ProductCard';

export default function Pagar() {

  return (
    <h1>Esta será la pagina donde luego de presionar el boton comprar, redirigira hasta aqui <br /> Para luego pedir informacion para realizar el envio.  </h1>
);
}