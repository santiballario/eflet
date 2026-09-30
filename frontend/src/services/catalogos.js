import { apiRequest } from '@/lib/api-client';

export async function listarEstadosViaje() {
  const { estados } = await apiRequest('/api/estados-viaje');
  return estados;
}

export async function listarMotivosNoEntrega() {
  const { motivos } = await apiRequest('/api/motivos-no-entrega');
  return motivos;
}
