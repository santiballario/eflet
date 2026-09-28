// Logica de negocio del CRUD de Vehiculo.
const db = require('../models');
const { AppError } = require('../lib/errors');
const tomarCampos = require('../lib/tomar-campos');

// Campos que el cliente puede enviar. id, modificado_por, fechas de
// auditoria, etc. los maneja el sistema y se ignoran si vienen en el body.
const CAMPOS_VEHICULO = ['patente', 'marca', 'modelo', 'cantidad_maxima', 'vencimiento_vtv', 'estado'];

async function listar() {
  // paranoid:true ya excluye los que tienen fecha_eliminacion seteada.
  return db.Vehiculo.findAll({ order: [['id', 'ASC']] });
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
  // paranoid:true -> esto es un UPDATE que llena fecha_eliminacion,
  // no un DELETE fisico (ver DER: baja logica en toda entidad auditada).
  await vehiculo.destroy();
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };
