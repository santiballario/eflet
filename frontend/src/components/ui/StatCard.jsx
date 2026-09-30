// Tarjeta con un numero grande (Panel de Control).
// tipo: '' | 'exito' | 'advertencia' | 'error' -> color del borde izquierdo.
export function StatCard({ titulo, valor, tipo = '' }) {
  return (
    <div className={`stat ${tipo}`}>
      <div className="valor">{valor}</div>
      <div className="titulo">{titulo}</div>
    </div>
  );
}
