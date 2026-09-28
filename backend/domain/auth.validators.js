// Reglas de validacion para los endpoints de autenticacion.
// Se corren antes que el controller (ver routes/auth.routes.js).
const { body } = require('express-validator');

const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio.')
    .isEmail().withMessage('El email no tiene un formato valido.'),
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria.'),
];

module.exports = { loginValidator };
