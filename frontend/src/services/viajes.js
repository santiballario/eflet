import { apiRequest } from '@/lib/api-client';

// filtros opcionales: { estado, conductor_id, vehiculo_id }
export async function listarViajes(filtros = {}) {
  const params = new URLSearchParams();
  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor) params.set(clave, valor);
  }
  const query = params.toString() ? `?${params}` : '';
  const { viajes } = await apiRequest(`/api/viajes${query}`);
  return viajes;
}

export async function obtenerViaje(id) {
  const { viaje } = await apiRequest(`/api/viajes/${id}`);
  return viaje;
}

// --- Administrador: armado de la hoja de ruta (solo En Deposito) ---

export async function crearViaje(datos) {
  const { viaje } = await apiRequest('/api/viajes', { method: 'POST', body: datos });
  return viaje;
}

export async function actualizarViaje(id, datos) {
  const { viaje } = await apiRequest(`/api/viajes/${id}`, { method: 'PUT', body: datos });
  return viaje;
}

export function eliminarViaje(id) {
  return apiRequest(`/api/viajes/${id}`, { method: 'DELETE' });
}

export async function agregarDestino(viajeId, datos) {
  const { destino } = await apiRequest(`/api/viajes/${viajeId}/destinos`, { method: 'POST', body: datos });
  return destino;
}

export function eliminarDestino(viajeId, destinoId) {
  return apiRequest(`/api/viajes/${viajeId}/destinos/${destinoId}`, { method: 'DELETE' });
}

// --- Conductor: recorrido ---

export async function registrarSalida(id, km_salida) {
  const { viaje } = await apiRequest(`/api/viajes/${id}/salida`, { method: 'POST', body: { km_salida } });
  return viaje;
}

export async function registrarEntrega(viajeId, destinoId, estado_entrega, motivo_id) {
  const { viaje } = await apiRequest(`/api/viajes/${viajeId}/destinos/${destinoId}/entrega`, {
    method: 'PATCH',
    body: { estado_entrega, motivo_id },
  });
  return viaje;
}

export async function registrarRegreso(id, km_regreso) {
  const { viaje } = await apiRequest(`/api/viajes/${id}/regreso`, { method: 'POST', body: { km_regreso } });
  return viaje;
}
