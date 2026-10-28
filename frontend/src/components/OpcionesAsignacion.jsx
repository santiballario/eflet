import { motivoConductorNoApto, motivoVehiculoNoApto } from '@/utils/aptitud';
import { nombreConductor } from '@/utils/formato';

// Opciones de los desplegables de Vehiculo y Conductor (crear y editar un viaje).
// Se muestran todos: los que no se pueden usar aparecen deshabilitados y con el
// motivo ("VTV vencida", "en la hoja de ruta #8"), asi se entiende por que no estan.
// Primero los disponibles, despues el resto.

function ordenar(lista, motivo) {
  return lista
    .map((item) => ({ item, motivo: motivo(item) }))
    .sort((a, b) => Number(Boolean(a.motivo)) - Number(Boolean(b.motivo)));
}

export function OpcionesVehiculo({ vehiculos, ocupados }) {
  return ordenar(vehiculos, (v) => motivoVehiculoNoApto(v, ocupados)).map(({ item: v, motivo }) => (
    <option key={v.id} value={v.id} disabled={Boolean(motivo)}>
      {v.patente} - {v.marca} {v.modelo} ({Number(v.cantidad_maxima)} kg){motivo && ` — ${motivo}`}
    </option>
  ));
}

export function OpcionesConductor({ conductores, ocupados }) {
  return ordenar(conductores, (c) => motivoConductorNoApto(c, ocupados)).map(({ item: c, motivo }) => (
    <option key={c.id} value={c.id} disabled={Boolean(motivo)}>
      {nombreConductor(c)}
      {motivo && ` — ${motivo}`}
    </option>
  ));
}
