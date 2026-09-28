// Reglas de validacion para viajes (hojas de ruta) y sus destinos.
// Aca solo se valida FORMA (tipos, obligatorios). Las reglas de NEGOCIO
// (VTV vencida, conductor ocupado, etc.) viven en services/viaje.service.js.
const { body, param, query } = require('express-validator');
const { ESTADO_ENTREGA, ESTADO_VIAJE } = require('./estados');

const idValidator = [param('id').isInt({ min: 1 }).withMessage('El id debe ser un numero.')];

const destinoIdValidator = [
  ...idValidator,
  param('destinoId').isInt({ min: 1 }).withMessage('El id del destino debe ser un numero.'),
];

// Campos de un destino, reutilizados al crear el viaje (array) y al
// agregar un destino suelto.
function reglasDestino(prefijo, opcional = false) {
  const campo = (nombre) => {
    const cadena = body(`${prefijo}${nombre}`);
    return opcional ? cadena.optional() : cadena;
  };
  return [
    campo('direccion_farmacia')
      .trim()
      .notEmpty().withMessage('La direccion de la farmacia es obligatoria.')
      .isLength({ max: 200 }).withMessage('La direccion no puede superar los 200 caracteres.'),
    campo('cantidad_bultos')
      .isInt({ min: 1 }).withMessage('La cantidad de bultos debe ser un entero mayor a 0.'),
    body(`${prefijo}orden`)
      .optional()
      .isInt({ min: 1 }).withMessage('El orden debe ser un entero mayor a 0.'),
  ];
}

const listarViajesValidator = [
  query('estado')
    .optional()
    .isIn(Object.values(ESTADO_VIAJE)).withMessage(`El estado debe ser uno de: ${Object.values(ESTADO_VIAJE).join(', ')}.`),
  query('conductor_id').optional().isInt({ min: 1 }).withMessage('conductor_id debe ser un numero.'),
  query('vehiculo_id').optional().isInt({ min: 1 }).withMessage('vehiculo_id debe ser un numero.'),
];

const crearViajeValidator = [
  body('vehiculo_id').isInt({ min: 1 }).withMessage('El vehiculo es obligatorio.'),
  body('conductor_id').isInt({ min: 1 }).withMessage('El conductor es obligatorio.'),
  body('destinos')
    .isArray({ min: 1 }).withMessage('El viaje debe tener al menos un destino.'),
  ...reglasDestino('destinos.*.'),
];

const actualizarViajeValidator = [
  ...idValidator,
  body('vehiculo_id').optional().isInt({ min: 1 }).withMessage('vehiculo_id debe ser un numero.'),
  body('conductor_id').optional().isInt({ min: 1 }).withMessage('conductor_id debe ser un numero.'),
];

const agregarDestinoValidator = [...idValidator, ...reglasDestino('')];

const actualizarDestinoValidator = [...destinoIdValidator, ...reglasDestino('', true)];

// Acciones del conductor
const salidaValidator = [
  ...idValidator,
  body('km_salida').isInt({ min: 0 }).withMessage('El kilometraje de salida debe ser un entero positivo.'),
];

const regresoValidator = [
  ...idValidator,
  body('km_regreso').isInt({ min: 0 }).withMessage('El kilometraje de regreso debe ser un entero positivo.'),
];

const entregaValidator = [
  ...destinoIdValidator,
  body('estado_entrega')
    .isIn([ESTADO_ENTREGA.ENTREGADO, ESTADO_ENTREGA.NO_ENTREGADO])
    .withMessage(`El estado de entrega debe ser "${ESTADO_ENTREGA.ENTREGADO}" o "${ESTADO_ENTREGA.NO_ENTREGADO}".`),
  body('motivo_id').optional({ values: 'null' }).isInt({ min: 1 }).withMessage('motivo_id debe ser un numero.'),
];

module.exports = {
  idValidator,
  destinoIdValidator,
  listarViajesValidator,
  crearViajeValidator,
  actualizarViajeValidator,
  agregarDestinoValidator,
  actualizarDestinoValidator,
  salidaValidator,
  regresoValidator,
  entregaValidator,
};
