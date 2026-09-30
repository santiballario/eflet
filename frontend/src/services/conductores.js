import { apiRequest } from '@/lib/api-client';

// Cada conductor viene con Usuario.Persona anidado (Usuario + Persona + Conductor).
export async function listarConductores() {
  const { conductores } = await apiRequest('/api/conductores');
  return conductores;
}

export async function obtenerConductor(id) {
  const { conductor } = await apiRequest(`/api/conductores/${id}`);
  return conductor;
}

export async function crearConductor(datos) {
  const { conductor } = await apiRequest('/api/conductores', { method: 'POST', body: datos });
  return conductor;
}

export async function actualizarConductor(id, datos) {
  const { conductor } = await apiRequest(`/api/conductores/${id}`, { method: 'PUT', body: datos });
  return conductor;
}

export function eliminarConductor(id) {
  return apiRequest(`/api/conductores/${id}`, { method: 'DELETE' });
}
