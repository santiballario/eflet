import { Avatar } from '@/components/ui/Avatar';
import { nombreConductor } from '@/utils/formato';

// Grafico de barras horizontales: cuantas entregas hizo cada conductor, sobre
// todos los viajes que ya trae la API (no hay endpoint nuevo).
// Barras de un solo color: comparan cantidades, no hace falta leyenda.
export function EntregasPorConductor({ viajes }) {
  const porConductor = new Map();
  for (const v of viajes) {
    if (!v.Conductor) continue;
    const fila = porConductor.get(v.Conductor.id) ?? { conductor: v.Conductor, entregadas: 0, paradas: 0 };
    for (const d of v.Destinos) {
      if (d.estado_entrega === 'Pendiente') continue;
      fila.paradas += 1;
      if (d.estado_entrega === 'Entregado') fila.entregadas += 1;
    }
    porConductor.set(v.Conductor.id, fila);
  }
  const filas = [...porConductor.values()].sort((a, b) => b.entregadas - a.entregadas);
  const maximo = Math.max(1, ...filas.map((f) => f.entregadas));

  if (filas.length === 0) return null;

  return (
    <ul className="barras">
      {filas.map(({ conductor, entregadas, paradas }) => {
        const persona = conductor.Usuario?.Persona;
        const efectividad = paradas ? Math.round((entregadas / paradas) * 100) : 0;
        const descripcion = `${nombreConductor(conductor)}: ${entregadas} entregadas de ${paradas} paradas (${efectividad}%)`;
        return (
          <li key={conductor.id} className="barra-fila" title={descripcion} aria-label={descripcion}>
            <span className="persona barra-nombre">
              <Avatar nombre={persona?.nombre} apellido={persona?.apellido} chico />
              <span>{nombreConductor(conductor)}</span>
            </span>
            <span className="barra-pista" aria-hidden="true">
              <span className="barra" style={{ width: `${(entregadas / maximo) * 100}%` }} />
            </span>
            <span className="barra-valor" aria-hidden="true">
              <strong>{entregadas}</strong>
              <span className="chico texto-suave"> · {efectividad}%</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
