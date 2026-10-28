import { Check } from 'lucide-react';
import { formatearFechaHora } from '@/utils/formato';

const PASOS = ['En Depósito', 'En Viaje', 'Entregado', 'Finalizado'];

// Los 4 estados del viaje en una linea, con los pasos ya hechos marcados.
// "Entregado" no tiene fecha propia: el viaje llega solo cuando no quedan paradas pendientes.
export function LineaEstados({ viaje }) {
  const actual = PASOS.indexOf(viaje.EstadoViaje.descripcion);
  const fechas = {
    'En Depósito': viaje.fecha_creacion,
    'En Viaje': viaje.fecha_salida,
    Finalizado: viaje.fecha_regreso,
  };

  return (
    <ol className="linea-estados" aria-label="Estado del viaje">
      {PASOS.map((paso, i) => {
        // Finalizado es el ultimo paso: ahi ya no hay "actual", estan todos hechos.
        const hecho = i < actual || actual === PASOS.length - 1;
        const clase = hecho ? 'hecho' : i === actual ? 'actual' : 'pendiente';
        return (
          <li key={paso} className={clase} aria-current={i === actual ? 'step' : undefined}>
            <span className="linea-punto">{hecho ? <Check size={14} aria-hidden="true" /> : i + 1}</span>
            <span className="linea-texto">
              <strong>{paso}</strong>
              {i <= actual && fechas[paso] && <span className="chico texto-suave">{formatearFechaHora(fechas[paso])}</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
