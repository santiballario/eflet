// Un "Conductor" para el usuario final es una sola cosa, pero en la base
// son 3 tablas relacionadas (ver DER): Usuario (login), Persona (datos
// personales) y Conductor (datos de licencia). Este service las maneja
// juntas, siempre dentro de una transaccion: si algo falla, no queda
// ninguna de las 3 filas a medio crear.
const db = require('../models');
const { hashPassword } = require('../lib/password');
const { AppError } = require('../lib/errors');

// Incluye siempre los datos de Usuario y Persona relacionados, para no
// tener que pedir 3 endpoints distintos desde el frontend.
const INCLUDE_COMPLETO = [
  { model: db.Usuario, attributes: ['id', 'email', 'rol'] },
  { model: db.Persona, attributes: ['nombre', 'apellido', 'dni', 'telefono'] },
];

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

async function crear(datos) {
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

  // Transaccion: si falla el paso 2 o 3, se deshace el paso 1 tambien.
  return db.sequelize.transaction(async (t) => {
    const passwordHash = await hashPassword(password);

    const usuario = await db.Usuario.create(
      { email, password_hash: passwordHash, rol: 'Conductor' },
      { transaction: t }
    );

    await db.Persona.create(
      { usuario_id: usuario.id, nombre, apellido, dni, telefono },
      { transaction: t }
    );

    const conductor = await db.Conductor.create(
      { usuario_id: usuario.id, nro_licencia, vencimiento_licencia },
      { transaction: t }
    );

    return obtenerPorId(conductor.id);
  });
}

async function actualizar(id, datos, usuarioId) {
  const conductor = await obtenerPorId(id);

  const { nombre, apellido, telefono, ...datosConductor } = datos;

  return db.sequelize.transaction(async (t) => {
    // nombre/apellido/telefono viven en Persona, no en Conductor.
    if (nombre || apellido || telefono) {
      const persona = await db.Persona.findOne({ where: { usuario_id: conductor.usuario_id }, transaction: t });
      await persona.update(
        {
          ...(nombre && { nombre }),
          ...(apellido && { apellido }),
          ...(telefono && { telefono }),
          modificado_por: usuarioId,
        },
        { transaction: t }
      );
    }

    if (Object.keys(datosConductor).length > 0) {
      await conductor.update({ ...datosConductor, modificado_por: usuarioId }, { transaction: t });
    }

    return obtenerPorId(id);
  });
}

async function eliminar(id) {
  const conductor = await obtenerPorId(id);

  // Baja logica en cascada manual: Conductor, Persona y Usuario (asi el
  // conductor tambien pierde el acceso para loguearse).
  return db.sequelize.transaction(async (t) => {
    await conductor.destroy({ transaction: t });
    await db.Persona.destroy({ where: { usuario_id: conductor.usuario_id }, transaction: t });
    await db.Usuario.destroy({ where: { id: conductor.usuario_id }, transaction: t });
  });
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };
