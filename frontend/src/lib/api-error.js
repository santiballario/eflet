// Error propio para distinguir "el backend respondio con un error HTTP"
// de un error de red (backend apagado, CORS bloqueando, etc).
// Las pantallas usan `error.status` para decidir que mostrar
// (401 -> volver a loguearse, 403 -> sin permiso, 409 -> regla de negocio).
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}
