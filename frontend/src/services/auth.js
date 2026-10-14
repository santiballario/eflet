import { apiRequest } from '@/lib/api-client';

// POST /api/auth/login -> { token, usuario: { id, email, rol } }
export function login({ email, password }) {
  return apiRequest('/api/auth/login', { method: 'POST', body: { email, password } });
}

// GET /api/auth/me -> perfil del usuario logueado: { id, email, rol, nombre,
// apellido, dni, telefono, conductor } (conductor = datos de la licencia o null).
// Tambien sirve para validar el token guardado despues de un F5.
export async function getMe() {
  const { usuario } = await apiRequest('/api/auth/me');
  return usuario;
}

// PATCH /api/auth/me -> el usuario cambia su telefono (es el unico dato que puede editar)
export async function actualizarPerfil({ telefono }) {
  const { usuario } = await apiRequest('/api/auth/me', { method: 'PATCH', body: { telefono } });
  return usuario;
}

// PUT /api/auth/password -> el usuario logueado cambia su contraseña
export function cambiarPassword({ password_actual, password_nueva }) {
  return apiRequest('/api/auth/password', { method: 'PUT', body: { password_actual, password_nueva } });
}
