import { ApiError } from './api-error';
import { emitSessionExpired } from './session-events';
import { getToken } from './token-storage';

// VITE_API_URL es publica (queda en el bundle), por eso puede tener default.
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

/**
 * fetch para toda la app:
 *  - agrega el header Authorization con el token (si hay sesion),
 *  - manda el body como JSON,
 *  - si el status no es 2xx lanza ApiError con el "mensaje" del backend,
 *  - ante un 401 avisa que la sesion vencio (el contexto desloguea).
 */
export async function apiRequest(path, { body, ...options } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // fetch solo lanza si no hubo respuesta: backend apagado, sin red o CORS.
    throw new ApiError(0, 'No se pudo conectar con el servidor.');
  }

  if (!response.ok) {
    const mensaje = await leerMensajeDeError(response);
    // Un 401 con token significa que vencio o es invalido. El 401 del login
    // (sin token todavia) no es "sesion vencida", es contrasena incorrecta.
    if (response.status === 401 && token) emitSessionExpired();
    throw new ApiError(response.status, mensaje);
  }

  if (response.status === 204) return undefined;
  return response.json();
}

// El backend siempre responde los errores como { error, mensaje, codigo }.
async function leerMensajeDeError(response) {
  try {
    const data = await response.json();
    if (typeof data?.mensaje === 'string') return data.mensaje;
  } catch {
    // el body no era JSON (o estaba vacio): usamos el fallback
  }
  return `Error ${response.status}`;
}
