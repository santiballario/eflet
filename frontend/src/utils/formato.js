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

// Dia (en la hora de la compu) de una fecha con hora, como 'YYYY-MM-DD':
// el mismo formato que devuelve un <input type="date">, para compararlos.
export function diaLocal(fechaIso) {
  if (!fechaIso) return null;
  const d = new Date(fechaIso);
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

// "Miércoles, 28 de octubre": para el encabezado de los inicios.
export function fechaDeHoyLarga() {
  const texto = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function hoyLocal() {
  return diaLocal(new Date().toISOString());
}

export function nombreConductor(conductor) {
  const persona = conductor?.Usuario?.Persona;
  return persona ? `${persona.nombre} ${persona.apellido}` : '-';
}

// Para el usuario logueado (login / perfil), que trae nombre y apellido directo
export function nombreCompleto(usuario) {
  if (!usuario?.nombre) return usuario?.email ?? '';
  return `${usuario.nombre} ${usuario.apellido ?? ''}`.trim();
}

export function descripcionVehiculo(vehiculo) {
  return vehiculo ? `${vehiculo.patente} - ${vehiculo.marca} ${vehiculo.modelo}` : '-';
}
