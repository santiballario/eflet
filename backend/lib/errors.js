// Error "de negocio" con codigo HTTP asociado. Se lanza desde cualquier
// service/controller y el error-handler centralizado sabe como responderlo.
class AppError extends Error {
  constructor(mensaje, statusCode = 400) {
    super(mensaje);
    this.statusCode = statusCode;
  }
}

module.exports = { AppError };
