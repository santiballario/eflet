// Un "Conductor" para el usuario final es una sola cosa, pero en la base
// son 3 tablas relacionadas (ver DER): Usuario (login), Persona (datos
// personales) y Conductor (datos de licencia). Este service las maneja
// juntas, siempre dentro de una transaccion: si algo falla, no queda
// ninguna de las 3 filas a medio crear.
const db = require('../models');
const { hashPassword } = require('../lib/password');
const { AppError } = require('../lib/errors');
const tomarCampos = require('../lib/tomar-campos');

// Incluye siempre los datos de Usuario y Persona relacionados, para no
// tener que pedir 3 endpoints distintos desde el frontend.
// Persona cuelga de Usuario (no de Conductor), por eso va anidada:
// Conductor -> Usuario -> Persona, igual que en el DER.
const INCLUDE_COMPLETO = [
  {
    model: db.Usuario,
    attributes: ['id', 'email', 'rol'],
    include: [{ model: db.Persona, attributes: ['nombre', 'apellido', 'dni', 'telefono'] }],
  },
];

// Campos que el cliente puede modificar. Cualquier otro que venga en el
// body (usuario_id, modificado_por, etc.) se ignora.
const CAMPOS_PERSONA = ['nombre', 'apellido', 'telefono'];
const CAMPOS_CONDUCTOR = ['nro_licencia', 'vencimiento_licencia', 'disponibilidad'];

async function listar() {
  return db.Conductor.findAll({ include: INCLUDE_COMPLETO, order: [['id', 'ASC']] });
}

async function obtenerPorId(id) {
  const conductor = await db.Conductor.findByPk(id, { include: INCLUDE_COMPLETO });
  if (!conductor) {
    throw new AppError('Conductor no encontrado.', 404);
  }
  return conductor;
}

async function crear(datos, usuarioId) {
  const { email, password, nombre, apellido, dni, telefono, nro_licencia, vencimiento_licencia } = datos;

  const emailExistente = await db.Usuario.findOne({ where: { email } });
  if (emailExistente) {
    throw new AppError('Ya existe un usuario con ese email.', 409);
  }
  const dniExistente = await db.Persona.findOne({ where: { dni } });
  if (dniExistente) {
    throw new AppError('Ya existe una persona con ese DNI.', 409);
  }
  const licenciaExistente = await db.Conductor.findOne({ where: { nro_licencia } });
  if (licenciaExistente) {
    throw new AppError('Ya existe un conductor con ese numero de licencia.', 409);
  }

  // El hash es lento (bcrypt): lo calculamos antes de abrir la transaccion
  // para no tenerla abierta mas tiempo del necesario.
  const passwordHash = await hashPassword(password);

  // Transaccion: si falla el paso 2 o 3, se deshace el paso 1 tambien.
  const conductorId = await db.sequelize.transaction(async (t) => {
    const usuario = await db.Usuario.create(
      { email, password_hash: passwordHash, rol: 'Conductor' },
      { transaction: t }
    );

    await db.Persona.create(
      { usuario_id: usuario.id, nombre, apellido, dni, telefono, modificado_por: usuarioId },
      { transaction: t }
    );

    const conductor = await db.Conductor.create(
      { usuario_id: usuario.id, nro_licencia, vencimiento_licencia, modificado_por: usuarioId },
      { transaction: t }
    );

    return conductor.id;
  });

  // Se consulta recien despues del commit: dentro de la transaccion, una
  // consulta "afuera" de ella todavia no ve las filas recien creadas.
  return obtenerPorId(conductorId);
}

async function actualizar(id, datos, usuarioId) {
  const conductor = await obtenerPorId(id);

  const cambiosPersona = tomarCampos(datos, CAMPOS_PERSONA);
  const cambiosConductor = tomarCampos(datos, CAMPOS_CONDUCTOR);

  if (cambiosConductor.nro_licencia && cambiosConductor.nro_licencia !== conductor.nro_licencia) {
    const licenciaExistente = await db.Conductor.findOne({
      where: { nro_licencia: cambiosConductor.nro_licencia },
    });
    if (licenciaExistente) {
      throw new AppError('Ya existe un conductor con ese numero de licencia.', 409);
    }
  }

  await db.sequelize.transaction(async (t) => {
    // nombre/apellido/telefono viven en Persona, no en Conductor.
    if (Object.keys(cambiosPersona).length > 0) {
      await db.Persona.update(
        { ...cambiosPersona, modificado_por: usuarioId },
        { where: { usuario_id: conductor.usuario_id }, transaction: t }
      );
    }

    if (Object.keys(cambiosConductor).length > 0) {
      await conductor.update({ ...cambiosConductor, modificado_por: usuarioId }, { transaction: t });
    }
  });

  return obtenerPorId(id);
}

async function eliminar(id) {
  const conductor = await obtenerPorId(id);

  // Integridad: no dar de baja a un conductor con una hoja de ruta sin
  // terminar (require aca adentro para evitar dependencia circular).
  const { tieneViajeActivo } = require('./viaje.service');
  if (await tieneViajeActivo('conductor_id', conductor.id)) {
    throw new AppError('No se puede eliminar: el conductor esta asignado a un viaje sin finalizar.', 409);
  }

  // Baja logica en cascada manual: Conductor, Persona y Usuario (asi el
  // conductor tambien pierde el acceso para loguearse).
  return db.sequelize.transaction(async (t) => {
    await conductor.destroy({ transaction: t });
    await db.Persona.destroy({ where: { usuario_id: conductor.usuario_id }, transaction: t });
    await db.Usuario.destroy({ where: { id: conductor.usuario_id }, transaction: t });
  });
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };
