// Devuelve solo los campos permitidos de un objeto (normalmente req.body).
// Evita el "mass assignment": si el cliente manda campos extra como
// usuario_id o modificado_por, nunca llegan al ORM.
module.exports = function tomarCampos(datos, permitidos) {
  const resultado = {};
  for (const campo of permitidos) {
    if (datos[campo] !== undefined) resultado[campo] = datos[campo];
  }
  return resultado;
};
