// Pantalla neutra mientras se verifica la sesion (al abrir la app o recargar).
// Antes se veia el esqueleto de una pantalla sin el menu, y parecia otra interfaz.
export function PantallaCarga() {
  return (
    <div className="pantalla-carga" role="status" aria-live="polite">
      <img src="/favicon.svg" alt="" width="48" height="48" />
      <span className="sr-only">Cargando...</span>
    </div>
  );
}
