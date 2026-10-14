// Barra de avance de las paradas de un viaje ("2 de 3 paradas").
// role="progressbar" + aria-value*: los lectores de pantalla leen el avance.
export function Progreso({ hechas, total }) {
  const porcentaje = total ? Math.round((hechas / total) * 100) : 0;
  return (
    <div className="progreso">
      <div className="progreso-texto">
        <span>Paradas resueltas</span>
        <strong>
          {hechas} de {total}
        </strong>
      </div>
      <div
        className="progreso-barra"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={hechas}
        aria-label="Paradas resueltas"
      >
        <div className="progreso-relleno" style={{ width: `${porcentaje}%` }} />
      </div>
    </div>
  );
}
