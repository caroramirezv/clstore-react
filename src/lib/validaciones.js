
export function validarRunChileno(run) {
  const runLimpio = run.replace(/[.\-\s]/g, '').toUpperCase();
  if (runLimpio.length < 7 || runLimpio.length > 9) return false;

  const cuerpo = runLimpio.slice(0, -1);
  const dvIngresado = runLimpio.slice(-1);

  if (!/^\d+$/.test(cuerpo)) return false;

  let suma = 0;
  let multiplicador = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i), 10) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  let dvEsperado = 11 - (suma % 11);
  if (dvEsperado === 11) dvEsperado = '0';
  else if (dvEsperado === 10) dvEsperado = 'K';
  else dvEsperado = dvEsperado.toString();

  return dvIngresado === dvEsperado;
}

export function formatearRun(run) {
  return run.replace(/[.\-\s]/g, '').toUpperCase();
}

const DOMINIOS_VALIDOS = ['@duoc.cl', '@profesor.duoc.cl', '@gmail.com'];

export function validarDominioCorreo(correo) {
  return DOMINIOS_VALIDOS.some((dominio) => correo.toLowerCase().endsWith(dominio));
}

export function formatoCLP(valor) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(valor || 0);
}
