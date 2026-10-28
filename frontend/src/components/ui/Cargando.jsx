// Mientras llegan los datos: bloques grises animados con la forma aproximada
// de la pantalla (tres tarjetas y una tabla), en lugar de un texto suelto.
// role="status" + texto oculto: el lector de pantalla anuncia que esta cargando.
export function Cargando({ texto = 'Cargando...' }) {
  return (
    <div className="esqueleto" role="status" aria-live="polite">
      <span className="sr-only">{texto}</span>
      <div className="esqueleto-fila" aria-hidden="true">
        <div className="esqueleto-bloque" style={{ height: 96 }} />
        <div className="esqueleto-bloque" style={{ height: 96 }} />
        <div className="esqueleto-bloque" style={{ height: 96 }} />
      </div>
      <div className="esqueleto-bloque" style={{ height: 220 }} aria-hidden="true" />
    </div>
  );
}
