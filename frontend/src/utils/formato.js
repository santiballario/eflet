// Las fechas DATEONLY llegan como 'YYYY-MM-DD'. Con new Date('2027-06-30')
// JS la toma como UTC y en Argentina (UTC-3) se veria un dia antes, por eso
// la armamos a mano.
export function formatearFecha(fechaIso) {
  if (!fechaIso) return '-';
  const [anio, mes, dia] = fechaIso.slice(0, 10).split('-');
  return `${dia}/${mes}/${anio}`;
}

// Para fechas con hora (DATE), que si vienen en UTC con zona.
export function formatearFechaHora(fechaIso) {
  if (!fechaIso) return '-';
  return new Date(fechaIso).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
}

// Dias que faltan hasta una fecha 'YYYY-MM-DD' (negativo = ya vencio).
export function diasHasta(fechaIso) {
  const [anio, mes, dia] = fechaIso.slice(0, 10).split('-').map(Number);
  const objetivo = new Date(anio, mes - 1, dia);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.round((objetivo - hoy) / 86400000);
}

export function nombreConductor(conductor) {
  const persona = conductor?.Usuario?.Persona;
  return persona ? `${persona.nombre} ${persona.apellido}` : '-';
}

export function descripcionVehiculo(vehiculo) {
  return vehiculo ? `${vehiculo.patente} - ${vehiculo.marca} ${vehiculo.modelo}` : '-';
}
