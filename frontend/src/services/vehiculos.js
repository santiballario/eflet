import { apiRequest } from '@/lib/api-client';

export async function listarVehiculos() {
  const { vehiculos } = await apiRequest('/api/vehiculos');
  return vehiculos;
}

export async function obtenerVehiculo(id) {
  const { vehiculo } = await apiRequest(`/api/vehiculos/${id}`);
  return vehiculo;
}

export async function crearVehiculo(datos) {
  const { vehiculo } = await apiRequest('/api/vehiculos', { method: 'POST', body: datos });
  return vehiculo;
}

export async function actualizarVehiculo(id, datos) {
  const { vehiculo } = await apiRequest(`/api/vehiculos/${id}`, { method: 'PUT', body: datos });
  return vehiculo;
}

export function eliminarVehiculo(id) {
  return apiRequest(`/api/vehiculos/${id}`, { method: 'DELETE' });
}
