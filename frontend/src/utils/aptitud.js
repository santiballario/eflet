import { diasHasta } from './formato';

// Por que un vehiculo o un conductor no se puede asignar a una hoja de ruta.
// Devuelve el motivo para mostrarlo en el desplegable, o null si se puede usar.
// Es solo una ayuda: el backend vuelve a controlar todo al guardar.

// { vehiculo_id o conductor_id -> numero de la hoja de ruta sin finalizar que lo ocupa }
export function ocupadosPorViajes(viajes, campo, viajeExcluido) {
  const ocupados = new Map();
  for (const v of viajes ?? []) {
    if (v.EstadoViaje?.descripcion !== 'Finalizado' && v.id !== viajeExcluido) ocupados.set(v[campo], v.id);
  }
  return ocupados;
}

export function motivoVehiculoNoApto(vehiculo, ocupados) {
  if (vehiculo.estado !== 'Activo') return vehiculo.estado.toLowerCase();
  if (diasHasta(vehiculo.vencimiento_vtv) < 0) return 'VTV vencida';
  if (ocupados.has(vehiculo.id)) return `en la hoja de ruta #${ocupados.get(vehiculo.id)}`;
  return null;
}

export function motivoConductorNoApto(conductor, ocupados) {
  if (diasHasta(conductor.vencimiento_licencia) < 0) return 'licencia vencida';
  if (conductor.disponibilidad === 'No disponible') return 'no disponible';
  if (ocupados.has(conductor.id)) return `en la hoja de ruta #${ocupados.get(conductor.id)}`;
  if (conductor.disponibilidad !== 'Disponible') return conductor.disponibilidad.toLowerCase();
  return null;
}
