// Logica de negocio del CRUD de Vehiculo.
const db = require('../models');
const { AppError } = require('../lib/errors');
const tomarCampos = require('../lib/tomar-campos');

// Campos que el cliente puede enviar. id, modificado_por, fechas de
// auditoria, etc. los maneja el sistema y se ignoran si vienen en el body.
const CAMPOS_VEHICULO = ['patente', 'marca', 'modelo', 'cantidad_maxima', 'vencimiento_vtv', 'estado'];

// Km del ultimo regreso registrado del vehiculo (null si todavia no hizo ningun viaje).
// Subconsulta sobre viajes: el valor se calcula en la base, en la misma consulta.
const ULTIMO_KM = db.sequelize.literal(`(
  SELECT v.km_regreso FROM viajes v
  WHERE v.vehiculo_id = Vehiculo.id AND v.km_regreso IS NOT NULL AND v.fecha_eliminacion IS NULL
  ORDER BY v.fecha_regreso DESC LIMIT 1
)`);

async function listar() {
  // paranoid:true ya excluye los que tienen fecha_eliminacion seteada.
  return db.Vehiculo.findAll({
    attributes: { include: [[ULTIMO_KM, 'ultimo_km']] },
    order: [['id', 'ASC']],
  });
}

async function obtenerPorId(id) {
  const vehiculo = await db.Vehiculo.findByPk(id);
  if (!vehiculo) {
    throw new AppError('Vehiculo no encontrado.', 404);
  }
  return vehiculo;
}

async function crear(datos, usuarioId) {
  const nuevo = tomarCampos(datos, CAMPOS_VEHICULO);

  const patenteExistente = await db.Vehiculo.findOne({ where: { patente: nuevo.patente } });
  if (patenteExistente) {
    throw new AppError('Ya existe un vehiculo con esa patente.', 409);
  }
  return db.Vehiculo.create({ ...nuevo, modificado_por: usuarioId });
}

async function actualizar(id, datos, usuarioId) {
  const vehiculo = await obtenerPorId(id);
  const cambios = tomarCampos(datos, CAMPOS_VEHICULO);

  if (cambios.patente && cambios.patente !== vehiculo.patente) {
    const patenteExistente = await db.Vehiculo.findOne({ where: { patente: cambios.patente } });
    if (patenteExistente) {
      throw new AppError('Ya existe un vehiculo con esa patente.', 409);
    }
  }

  await vehiculo.update({ ...cambios, modificado_por: usuarioId });
  return vehiculo;
}

async function eliminar(id) {
  const vehiculo = await obtenerPorId(id);

  // Integridad: no dar de baja un vehiculo que esta en una hoja de ruta
  // sin terminar (require aca adentro para evitar dependencia circular).
  const { tieneViajeActivo } = require('./viaje.service');
  if (await tieneViajeActivo('vehiculo_id', vehiculo.id)) {
    throw new AppError('No se puede eliminar: el vehiculo esta asignado a un viaje sin finalizar.', 409);
  }

  // paranoid:true -> esto es un UPDATE que llena fecha_eliminacion,
  // no un DELETE fisico (ver DER: baja logica en toda entidad auditada).
  await vehiculo.destroy();
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };
