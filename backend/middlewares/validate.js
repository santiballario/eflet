// Corre despues de los validators de express-validator (ver domain/*.js).
// Si encuentra errores, corta la solicitud con 400 y el detalle de que
// campo esta mal - asi el controller nunca recibe datos invalidos.
const { validationResult } = require('express-validator');
const { AppError } = require('../lib/errors');

module.exports = function validate(req, res, next) {
  const errores = validationResult(req);
  if (errores.isEmpty()) {
    return next();
  }

  const primerError = errores.array()[0];
  next(new AppError(primerError.msg, 400));
};
