// Reglas de validacion para el CRUD de Vehiculo.
const { body, param } = require('express-validator');

const ESTADOS_VALIDOS = ['Activo', 'En mantenimiento', 'Baja'];

// La columna es DECIMAL(6,2): admite hasta 9999,99. Sin este tope, un numero
// mas grande llegaba a la base y MySQL respondia con un error 500.
const CAPACIDAD_MAXIMA_KG = 9999.99;
const MENSAJE_CAPACIDAD = `La capacidad maxima debe ser un numero mayor a 0 y de hasta ${CAPACIDAD_MAXIMA_KG} kg.`;

const crearVehiculoValidator = [
  body('patente')
    .trim()
    .notEmpty().withMessage('La patente es obligatoria.')
    .isLength({ max: 10 }).withMessage('La patente no puede tener mas de 10 caracteres.'),
  body('marca')
    .trim()
    .notEmpty().withMessage('La marca es obligatoria.'),
  body('modelo')
    .trim()
    .notEmpty().withMessage('El modelo es obligatorio.'),
  body('cantidad_maxima')
    .notEmpty().withMessage('La cantidad maxima es obligatoria.')
    .isFloat({ gt: 0, max: CAPACIDAD_MAXIMA_KG }).withMessage(MENSAJE_CAPACIDAD),
  body('vencimiento_vtv')
    .notEmpty().withMessage('El vencimiento de la VTV es obligatorio.')
    .isDate().withMessage('El vencimiento de la VTV debe ser una fecha valida (YYYY-MM-DD).'),
  body('estado')
    .optional()
    .isIn(ESTADOS_VALIDOS).withMessage(`El estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}.`),
];

// En la actualizacion todos los campos son opcionales (se puede mandar
// solo lo que se quiere cambiar), pero si vienen, se validan igual.
const actualizarVehiculoValidator = [
  param('id').isInt().withMessage('El id debe ser un numero.'),
  body('patente').optional().trim().isLength({ max: 10 }),
  body('marca').optional().trim().notEmpty(),
  body('modelo').optional().trim().notEmpty(),
  body('cantidad_maxima').optional().isFloat({ gt: 0, max: CAPACIDAD_MAXIMA_KG }).withMessage(MENSAJE_CAPACIDAD),
  body('vencimiento_vtv').optional().isDate(),
  body('estado').optional().isIn(ESTADOS_VALIDOS),
];

const idValidator = [param('id').isInt().withMessage('El id debe ser un numero.')];

module.exports = { crearVehiculoValidator, actualizarVehiculoValidator, idValidator };
