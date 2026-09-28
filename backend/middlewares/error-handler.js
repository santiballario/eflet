// Middleware centralizado de errores. Va SIEMPRE al final de app.js.
// Formato de respuesta consistente en toda la API: { error, mensaje, codigo }
module.exports = function errorHandler(err, req, res, next) {
  // Log completo (con stack trace) solo del lado del servidor.
  // Nunca se lo devolvemos al cliente: filtrar el stack trace expone
  // detalles internos que un atacante podria aprovechar.
  console.error(err);

  const codigo = err.statusCode || 500;
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
