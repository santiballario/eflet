// Color de cada estado segun el documento de diseno:
// verde = terminado/ok, amarillo = en curso/atencion, rojo = problema.
const COLORES = {
  // Viaje
  'En Depósito': 'info',
  'En Viaje': 'advertencia',
  Entregado: 'exito',
  Finalizado: 'exito',
  // Destino
  Pendiente: 'neutro',
  'No entregado': 'error',
  // Conductor
  Disponible: 'exito',
  'En viaje': 'advertencia',
  'No disponible': 'error',
  // Vehiculo
  Activo: 'exito',
  'En mantenimiento': 'advertencia',
  Baja: 'error',
};

export function Badge({ estado }) {
  return <span className={`badge badge-${COLORES[estado] ?? 'neutro'}`}>{estado}</span>;
}
