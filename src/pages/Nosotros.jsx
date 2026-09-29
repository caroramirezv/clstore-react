export default function Nosotros() {
  return (
    <main className="content-body flex-grow-1">
      <div className="text-center my-4">
        <h1 className="fw-bold display-3">¿Quiénes somos?</h1>
      </div>

      <div className="clearfix mb-5">
        <div className="col-md-6 float-md-end mb-3 ms-md-4" style={{ maxWidth: 600 }}>
          <div id="carouselNosotros" className="carousel slide rounded overflow-hidden shadow-sm" data-bs-ride="carousel">
            <div className="carousel-inner">
              <div className="carousel-item active">
                <img src="/img/ubi2.png" className="d-block w-100" style={{ height: 380, objectFit: 'cover' }} alt="Local vista 1" />
              </div>
              <div className="carousel-item">
                <img src="/img/ubi3.png" className="d-block w-100" style={{ height: 380, objectFit: 'cover' }} alt="Local vista 2" />
              </div>
              <div className="carousel-item">
                <img src="/img/interior.png" className="d-block w-100" style={{ height: 380, objectFit: 'cover' }} alt="Interior tienda" />
              </div>
            </div>
            <button className="carousel-control-prev" type="button" data-bs-target="#carouselNosotros" data-bs-slide="prev">
              <span className="carousel-control-prev-icon" />
            </button>
            <button className="carousel-control-next" type="button" data-bs-target="#carouselNosotros" data-bs-slide="next">
              <span className="carousel-control-next-icon" />
            </button>
          </div>
        </div>

        <p className="fs-4">
          Somos una tienda especializada en productos tecnológicos, dedicada a ofrecer una amplia variedad de
          equipos y accesorios al mejor precio del mercado.
        </p>
        <p className="fs-4">
          Nuestro compromiso es brindar productos de calidad, atención personalizada y una experiencia de compra
          rápida, segura y confiable para todos nuestros clientes.
        </p>
        <p className="fs-4">
          En nuestra tienda encontrarás computadores, notebooks, periféricos, componentes, dispositivos móviles y
          mucho más, siempre con el respaldo de marcas reconocidas y un servicio orientado a satisfacer tus
          necesidades.
        </p>
      </div>

      <div className="row align-items-center g-4 my-5">
        <div className="col-12 col-md-5 text-center text-md-start">
          <h3 className="fw-bold mb-3">Encuéntranos en:</h3>
          <p className="fs-4">
            <i className="fa-solid fa-location-dot text-danger me-2"></i>
            <a
              href="https://maps.app.goo.gl/wAEHF5qsQ3KKPWoz8"
              target="_blank"
              rel="noopener noreferrer"
              className="text-decoration-none text-light"
            >
              Av. Antonio Varas (entre Carlos Antúnez y Av. Eliodoro Yáñez), Providencia, Santiago
            </a>
          </p>
        </div>
        <div className="col-12 col-md-7 text-center">
          <a href="https://maps.app.goo.gl/wAEHF5qsQ3KKPWoz8" target="_blank" rel="noopener noreferrer" className="d-block">
            <img
              src="/img/ubi.png"
              alt="Mapa de ubicación"
              className="img-fluid rounded shadow-sm"
              style={{ maxHeight: 400, width: '100%', objectFit: 'cover' }}
            />
          </a>
        </div>
      </div>

      <div className="my-5">
        <a
          className="btn fs-4 fw-bold w-100 rounded-3 d-flex align-items-center justify-content-center shadow"
          href="/"
          style={{ height: 65, backgroundColor: 'rgb(85,205,58)', color: 'rgb(20,20,20)', border: 'none' }}
        >
          <i className="fa-solid fa-bag-shopping me-2"></i> ¡Comenzar a comprar!
        </a>
      </div>
    </main>
  );
}
