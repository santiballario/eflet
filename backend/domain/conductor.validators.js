// Reglas de validacion para el CRUD de Conductor (que por dentro maneja
// Usuario + Persona + Conductor, ver services/conductor.service.js).
const { body, param } = require('express-validator');

const DISPONIBILIDAD_VALIDA = ['Disponible', 'En viaje', 'No disponible'];

const crearConductorValidator = [
  body('email').trim().notEmpty().withMessage('El email es obligatorio.').isEmail().withMessage('El email no tiene un formato valido.'),
  body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.'),
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio.'),
  body('apellido').trim().notEmpty().withMessage('El apellido es obligatorio.'),
  body('dni').trim().notEmpty().withMessage('El DNI es obligatorio.'),
  body('telefono').trim().notEmpty().withMessage('El telefono es obligatorio.'),
  body('nro_licencia').trim().notEmpty().withMessage('El numero de licencia es obligatorio.'),
  body('vencimiento_licencia').isDate().withMessage('El vencimiento de la licencia debe ser una fecha valida (YYYY-MM-DD).'),
];

const actualizarConductorValidator = [
  param('id').isInt().withMessage('El id debe ser un numero.'),
  body('nombre').optional().trim().notEmpty(),
  body('apellido').optional().trim().notEmpty(),
  body('telefono').optional().trim().notEmpty(),
  body('nro_licencia').optional().trim().notEmpty(),
  body('vencimiento_licencia').optional().isDate(),
  body('disponibilidad').optional().isIn(DISPONIBILIDAD_VALIDA).withMessage(`Debe ser uno de: ${DISPONIBILIDAD_VALIDA.join(', ')}.`),
];

const idValidator = [param('id').isInt().withMessage('El id debe ser un numero.')];

module.exports = { crearConductorValidator, actualizarConductorValidator, idValidator };
