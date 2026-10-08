import React from 'react';
import { formatoCLP } from '../test/validaciones';

export default function BoletaModal({ show, onClose, numOrden, codigoOrden, cliente, items, total }) {
  if (!show) return null;

  const neto = Math.round(total / 1.19);
  const iva = total - neto;
  const fechaActual = new Date().toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleImprimir = () => {
    window.print();
  };

  return (
    <>
      {/* Estilos CSS para simular un documento fiscal/boleta tributaria */}
      <style>{`
        .boleta-paper {
          font-family: 'Courier New', Courier, monospace;
          background-color: #ffffff;
          color: #000;
        }

        .border-dashed-bottom {
          border-bottom: 2px dashed #000;
        }

        .border-dashed-top {
          border-top: 2px dashed #000;
        }

        /* Simulación de Timbre Electrónico PDF417 del SII */
        .pdf417-barcode {
          background: repeating-linear-gradient(
            90deg,
            #000,
            #000 2px,
            #fff 2px,
            #fff 4px,
            #000 4px,
            #000 7px,
            #fff 7px,
            #fff 9px
          );
          height: 42px;
          width: 100%;
          max-width: 320px;
          margin: 0 auto;
        }

        @media print {
          body * {
            visibility: hidden;
          }
          #boleta-imprimir, #boleta-imprimir * {
            visibility: visible;
          }
          #boleta-imprimir {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Fondo oscuro del Modal */}
      <div
        className="modal fade show d-block no-print"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content shadow-lg border-0">
            {/* Header del Modal */}
            <div className="modal-header bg-light no-print">
              <h5 className="modal-title fw-bold text-dark">📄 Documento Tributario Electrónico</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            {/* CUERPO DE LA BOLETA (HOJA FISCAL) */}
            <div className="modal-body p-4 p-md-5 bg-secondary bg-opacity-10" id="boleta-imprimir">
              <div className="boleta-paper border border-2 border-dark p-4 mx-auto shadow-sm" style={{ maxWidth: '650px' }}>
                
                {/* Encabezado: Datos Emisor + Recuadro Fiscal SII */}
                <div className="row align-items-center mb-3">
                  <div className="col-7">
                    <h4 className="fw-bold mb-1 text-uppercase text-dark" style={{ letterSpacing: '1px' }}>CLSTORE SpA</h4>
                    <p className="mb-0 small fw-semibold">R.U.T.: 77.345.890-K</p>
                    <p className="mb-0 text-muted" style={{ fontSize: '11px' }}>GIRO: Venta de Videojuegos y Tecnología</p>
                    <p className="mb-0 text-muted" style={{ fontSize: '11px' }}>CASA MATRIZ: Av. Providencia 1234, Santiago</p>
                    <p className="mb-0 text-muted" style={{ fontSize: '11px' }}>WWW.CLSTORE.CL | CONTACTO@CLSTORE.CL</p>
                  </div>

                  {/* Recuadro Rojo de Boleta Electrónica SII */}
                  <div className="col-5">
                    <div className="border border-danger border-3 text-center p-2 text-danger">
                      <div className="fw-bold" style={{ fontSize: '13px' }}>R.U.T.: 77.345.890-K</div>
                      <div className="fw-bold my-1 text-uppercase" style={{ fontSize: '14px', letterSpacing: '0.5px' }}>
                        BOLETA ELECTRÓNICA
                      </div>
                      <div className="fw-bold fs-6">N° {numOrden || '20240705'}</div>
                      <div className="text-dark fw-bold border-top border-danger pt-1 mt-1" style={{ fontSize: '9px' }}>
                        S.I.I. - SANTIAGO ORIENTE
                      </div>
                    </div>
                  </div>
                </div>

                {/* Separador Punteado Troquelado */}
                <div className="border-dashed-bottom mb-3 pb-1"></div>

                {/* Datos del Receptor / Cliente */}
                <div className="row mb-3 text-uppercase" style={{ fontSize: '12px' }}>
                  <div className="col-7">
                    <p className="mb-1"><strong>SEÑOR(A):</strong> {cliente?.nombre} {cliente?.apellidos}</p>
                    <p className="mb-1"><strong>CORREO:</strong> {cliente?.correo}</p>
                    <p className="mb-1"><strong>DIRECCIÓN:</strong> {cliente?.calle} {cliente?.departamento && `DEPTO ${cliente?.departamento}`}</p>
                    <p className="mb-0"><strong>COMUNA/REG:</strong> {cliente?.comuna}, {cliente?.region}</p>
                  </div>
                  <div className="col-5 text-end">
                    <p className="mb-1"><strong>FECHA EMISIÓN:</strong> {fechaActual}</p>
                    <p className="mb-1"><strong>CÓD. ORDEN:</strong> {codigoOrden}</p>
                    <p className="mb-0"><strong>FORMA PAGO:</strong> WEBPAY / DEBITO</p>
                  </div>
                </div>

                {/* Detalle de Productos (Tabla estilo comprobante fiscal) */}
                <div className="table-responsive mb-3">
                  <table className="table table-sm border-top border-bottom border-dark text-uppercase align-middle mb-0" style={{ fontSize: '12px' }}>
                    <thead>
                      <tr className="border-bottom border-dark">
                        <th className="text-start py-2">DETALLE / PRODUCTO</th>
                        <th className="text-center py-2" style={{ width: '60px' }}>CANT</th>
                        <th className="text-end py-2" style={{ width: '100px' }}>P.UNIT</th>
                        <th className="text-end py-2" style={{ width: '110px' }}>TOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items && items.length > 0 ? (
                        items.map((it) => {
                          const p = it.productos || {};
                          const subtotal = (p.precio || 0) * it.cantidad;
                          return (
                            <tr key={it.producto_id} className="border-0">
                              <td className="text-start py-1">{p.nombre}</td>
                              <td className="text-center py-1">{it.cantidad}</td>
                              <td className="text-end py-1">{formatoCLP(p.precio)}</td>
                              <td className="text-end py-1">{formatoCLP(subtotal)}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center text-muted py-2">SIN DETALLE DE PRODUCTOS</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Totales y Desglose de Impuestos */}
                <div className="row justify-content-end mb-3 text-uppercase" style={{ fontSize: '12px' }}>
                  <div className="col-6">
                    <div className="d-flex justify-content-between mb-1">
                      <span>MONTO NETO:</span>
                      <span>{formatoCLP(neto)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span>I.V.A. (19%):</span>
                      <span>{formatoCLP(iva)}</span>
                    </div>
                    <div className="d-flex justify-content-between fw-bold fs-6 border-top border-dark pt-1 mt-1">
                      <span>TOTAL A PAGAR:</span>
                      <span>{formatoCLP(total)}</span>
                    </div>
                  </div>
                </div>

                {/* Pie Fiscal: Barcode + Timbre SII */}
                <div className="border-dashed-top pt-3 text-center">
                  <div className="pdf417-barcode border border-dark mb-2"></div>
                  <div className="fw-bold text-uppercase mb-1" style={{ fontSize: '10px', letterSpacing: '1px' }}>
                    TIMBRE ELECTRÓNICO S.I.I.
                  </div>
                  <p className="mb-0 text-muted text-uppercase" style={{ fontSize: '9px' }}>
                    Res. N° 80 del 2014 - Verifique documento en www.sii.cl
                  </p>
                  <p className="mb-0 text-muted" style={{ fontSize: '9px' }}>
                    El IVA de esta boleta ha sido retenido según la normativa legal vigente.
                  </p>
                </div>

              </div>
            </div>

            {/* Footer con Botones del Modal */}
            <div className="modal-footer bg-light no-print d-flex justify-content-between">
              <button type="button" className="btn btn-secondary px-4" onClick={onClose}>
                Cerrar
              </button>
              <button type="button" className="btn btn-danger px-4 fw-semibold" onClick={handleImprimir}>
                🖨️ Imprimir / Guardar en PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}