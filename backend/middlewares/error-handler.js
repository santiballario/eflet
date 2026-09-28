// Middleware centralizado de errores. Va SIEMPRE al final de app.js.
// Formato de respuesta consistente en toda la API: { error, mensaje, codigo }
module.exports = function errorHandler(err, req, res, next) {
  // Violacion de un UNIQUE de la base (ej: email o DNI de un registro dado
  // de baja logica, que sigue ocupando el valor). Es un conflicto del
  // cliente, no un error del servidor.
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: true,
      mensaje: 'Ya existe un registro con esos datos.',
      codigo: 409,
    });
  }

  const codigo = err.statusCode || 500;

  if (codigo === 500) {
    // Error inesperado: log completo (con stack trace) solo del lado del
    // servidor. Nunca se lo devolvemos al cliente: filtrar el stack trace
    // expone detalles internos que un atacante podria aprovechar.
    console.error(`[500] ${req.method} ${req.originalUrl}`, err);
  }
  // Los 4xx (datos invalidos, sin permiso, no encontrado...) son respuestas
  // esperadas del negocio, no fallas: no hace falta llenar el log con ellas.

  const mensaje =
    codigo === 500
      ? 'Ocurrio un error inesperado. Intenta nuevamente mas tarde.'
      : err.message;

  res.status(codigo).json({
    error: true,
    mensaje,
    codigo,
  });
};
