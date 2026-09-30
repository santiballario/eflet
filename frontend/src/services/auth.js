import { apiRequest } from '@/lib/api-client';

// POST /api/auth/login -> { token, usuario: { id, email, rol } }
export function login({ email, password }) {
  return apiRequest('/api/auth/login', { method: 'POST', body: { email, password } });
}

// GET /api/auth/me -> { usuario: { id, rol } } (sirve para validar el token guardado)
export async function getMe() {
  const { usuario } = await apiRequest('/api/auth/me');
  return usuario;
}
