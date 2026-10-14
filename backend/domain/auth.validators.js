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

const cambiarPasswordValidator = [
  body('password_actual')
    .notEmpty().withMessage('La contraseña actual es obligatoria.'),
  body('password_nueva')
    .isLength({ min: 8 }).withMessage('La nueva contraseña debe tener al menos 8 caracteres.')
    .custom((nueva, { req }) => nueva !== req.body.password_actual)
    .withMessage('La nueva contraseña tiene que ser distinta de la actual.'),
];

const actualizarPerfilValidator = [
  body('telefono')
    .trim()
    .notEmpty().withMessage('El teléfono es obligatorio.')
    .isLength({ max: 20 }).withMessage('El teléfono no puede tener más de 20 caracteres.')
    .matches(/^[0-9+\-\s()]+$/).withMessage('El teléfono solo puede tener números, espacios, guiones, paréntesis y +.'),
];

module.exports = { loginValidator, cambiarPasswordValidator, actualizarPerfilValidator };
