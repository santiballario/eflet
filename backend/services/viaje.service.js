// Logica de negocio de viajes (hojas de ruta) y sus destinos.
//
// Ciclo de vida de un viaje:
//   1. El Administrador lo crea con vehiculo, conductor y destinos -> "En Deposito"
//   2. El Conductor registra la salida con el km del vehiculo       -> "En Viaje"
//   3. El Conductor resuelve cada destino (Entregado / No entregado)
//      Cuando no queda ninguno "Pendiente"                          -> "Entregado"
//   4. El Conductor registra el regreso con el km final             -> "Finalizado"
//
// Mientras el viaje esta "En Deposito" el Administrador puede editarlo
// (cambiar vehiculo/conductor, agregar/quitar destinos) o eliminarlo.
const { Op } = require('sequelize');
const db = require('../models');
const { AppError } = require('../lib/errors');
const tomarCampos = require('../lib/tomar-campos');
const { ESTADO_VIAJE, ESTADO_ENTREGA, MOTIVO_OTRO, DISPONIBILIDAD, ESTADO_VEHICULO, LIMITES } = require('../domain/estados');

const CAMPOS_DESTINO = ['direccion_farmacia', 'cantidad_bultos', 'orden'];

// Datos relacionados que se devuelven siempre junto al viaje (un solo pedido arma la hoja de ruta).
// paranoid: false trae tambien a los dados de baja, para que el historial muestre quien hizo cada viaje.
const INCLUDE_VIAJE = [
  { model: db.EstadoViaje, attributes: ['id', 'descripcion'] },
  { model: db.Vehiculo, attributes: ['id', 'patente', 'marca', 'modelo', 'fecha_eliminacion'], paranoid: false },
  {
    model: db.Conductor,
    attributes: ['id', 'nro_licencia', 'fecha_eliminacion'],
    paranoid: false,
    include: [
      {
        model: db.Usuario,
        attributes: ['id', 'email'],
        paranoid: false,
        include: [{ model: db.Persona, attributes: ['nombre', 'apellido'], paranoid: false }],
      },
    ],
  },
  { model: db.Usuario, as: 'creador', attributes: ['id', 'email'], paranoid: false },
  {
    model: db.Destino,
    attributes: ['id', 'orden', 'direccion_farmacia', 'cantidad_bultos', 'estado_entrega', 'fecha_entrega', 'motivo_id', 'detalle_motivo'],
    include: [{ model: db.MotivoNoEntrega, attributes: ['id', 'descripcion'] }],
  },
];

// Los destinos siempre ordenados por el orden de la parada.
const ORDEN_VIAJE = [
  ['id', 'DESC'],
  [db.Destino, 'orden', 'ASC'],
];

// ---- Helpers ----

// Hoy como 'YYYY-MM-DD', para comparar con los vencimientos de VTV y licencia.
function hoy() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

async function estadoId(descripcion, transaction) {
  const estado = await db.EstadoViaje.findOne({ where: { descripcion }, transaction });
  if (!estado) {
    // Solo pasa si no se corrio el setup que carga los catalogos.
    throw new Error(`Falta el estado de viaje "${descripcion}" en la base. Correr npm run setup.`);
  }
  return estado.id;
}

// Un viaje "activo" es cualquiera que todavia no esta Finalizado.
async function tieneViajeActivo(campo, valor, viajeIdExcluido) {
  const where = { [campo]: valor };
  if (viajeIdExcluido) where.id = { [Op.ne]: viajeIdExcluido };

  const cantidad = await db.Viaje.count({
    where,
    include: [{ model: db.EstadoViaje, where: { descripcion: { [Op.ne]: ESTADO_VIAJE.FINALIZADO } } }],
  });
  return cantidad > 0;
}

// Reglas de negocio del documento de Persistencia: no asignar un vehiculo
// con VTV vencida ni uno que no este disponible.
async function validarVehiculo(vehiculoId, viajeIdExcluido) {
  const vehiculo = await db.Vehiculo.findByPk(vehiculoId);
  if (!vehiculo) throw new AppError('El vehiculo no existe.', 404);

  if (vehiculo.estado !== ESTADO_VEHICULO.ACTIVO) {
    throw new AppError(`El vehiculo ${vehiculo.patente} no esta activo (estado: ${vehiculo.estado}).`, 409);
  }
  if (vehiculo.vencimiento_vtv < hoy()) {
    throw new AppError(`El vehiculo ${vehiculo.patente} tiene la VTV vencida.`, 409);
  }
  if (await tieneViajeActivo('vehiculo_id', vehiculoId, viajeIdExcluido)) {
    throw new AppError(`El vehiculo ${vehiculo.patente} ya esta asignado a otro viaje sin finalizar.`, 409);
  }
  return vehiculo;
}

async function validarConductor(conductorId, viajeIdExcluido) {
  const conductor = await db.Conductor.findByPk(conductorId);
  if (!conductor) throw new AppError('El conductor no existe.', 404);

  if (conductor.disponibilidad !== DISPONIBILIDAD.DISPONIBLE) {
    throw new AppError(`El conductor no esta disponible (${conductor.disponibilidad}).`, 409);
  }
  if (conductor.vencimiento_licencia < hoy()) {
    throw new AppError('El conductor tiene la licencia vencida.', 409);
  }
  if (await tieneViajeActivo('conductor_id', conductorId, viajeIdExcluido)) {
    throw new AppError('El conductor ya esta asignado a otro viaje sin finalizar.', 409);
  }
  return conductor;
}

// Completa el orden de las paradas si no vino (1, 2, 3...) y verifica que
// no haya dos paradas con el mismo numero.
function normalizarDestinos(destinos) {
  const normalizados = destinos.map((d, i) => ({
    ...tomarCampos(d, CAMPOS_DESTINO),
    orden: d.orden !== undefined ? Number(d.orden) : i + 1,
  }));

  const ordenes = normalizados.map((d) => d.orden);
  if (new Set(ordenes).size !== ordenes.length) {
    throw new AppError('Hay dos destinos con el mismo numero de orden.', 400);
  }
  return normalizados;
}

// El token trae el id de Usuario; los viajes se buscan por el id de Conductor.
async function conductorDelUsuario(usuarioId) {
  const conductor = await db.Conductor.findOne({ where: { usuario_id: usuarioId } });
  if (!conductor) throw new AppError('El usuario no tiene un perfil de conductor.', 403);
  return conductor;
}

// Un Conductor solo puede ver y operar sus propios viajes.
async function verificarAcceso(viaje, usuario) {
  if (usuario.rol !== 'Conductor') return;
  const conductor = await conductorDelUsuario(usuario.id);
  if (viaje.conductor_id !== conductor.id) {
    throw new AppError('No tenes permiso sobre este viaje.', 403);
  }
}

async function buscarViaje(id, transaction) {
  const viaje = await db.Viaje.findByPk(id, {
    include: [{ model: db.EstadoViaje, attributes: ['descripcion'] }],
    transaction,
  });
  if (!viaje) throw new AppError('Viaje no encontrado.', 404);
  return viaje;
}

function exigirEstado(viaje, esperado, mensaje) {
  if (viaje.EstadoViaje.descripcion !== esperado) {
    throw new AppError(`${mensaje} (estado actual: ${viaje.EstadoViaje.descripcion}).`, 409);
  }
}

async function buscarDestino(viajeId, destinoId, transaction) {
  const destino = await db.Destino.findOne({ where: { id: destinoId, viaje_id: viajeId }, transaction });
  if (!destino) throw new AppError('Destino no encontrado en este viaje.', 404);
  return destino;
}

// ---- Consultas ----

async function listar(filtros, usuario) {
  const where = {};
  if (filtros.vehiculo_id) where.vehiculo_id = filtros.vehiculo_id;
  if (filtros.conductor_id) where.conductor_id = filtros.conductor_id;

  // El conductor ve solo los suyos, sin importar que filtro mande.
  if (usuario.rol === 'Conductor') {
    const conductor = await conductorDelUsuario(usuario.id);
    where.conductor_id = conductor.id;
  }

  const include = INCLUDE_VIAJE.map((inc) =>
    inc.model === db.EstadoViaje && filtros.estado ? { ...inc, where: { descripcion: filtros.estado } } : inc
  );

  return db.Viaje.findAll({ where, include, order: ORDEN_VIAJE });
}

async function obtenerPorId(id, usuario) {
  const viaje = await db.Viaje.findByPk(id, { include: INCLUDE_VIAJE, order: ORDEN_VIAJE });
  if (!viaje) throw new AppError('Viaje no encontrado.', 404);
  if (usuario) await verificarAcceso(viaje, usuario);
  return viaje;
}

// ---- Administrador: alta, modificacion y baja de hojas de ruta ----

async function crear(datos, usuarioId) {
  await validarVehiculo(datos.vehiculo_id);
  await validarConductor(datos.conductor_id);
  const destinos = normalizarDestinos(datos.destinos);

  // Viaje + destinos en una transaccion: o se crea todo o nada.
  const viajeId = await db.sequelize.transaction(async (t) => {
    const viaje = await db.Viaje.create(
      {
        vehiculo_id: datos.vehiculo_id,
        conductor_id: datos.conductor_id,
        usuario_creador_id: usuarioId,
        estado_id: await estadoId(ESTADO_VIAJE.EN_DEPOSITO, t),
        modificado_por: usuarioId,
      },
      { transaction: t }
    );

    await db.Destino.bulkCreate(
      destinos.map((d) => ({ ...d, viaje_id: viaje.id })),
      { transaction: t }
    );

    return viaje.id;
  });

  return obtenerPorId(viajeId);
}

async function actualizar(id, datos, usuarioId) {
  const viaje = await buscarViaje(id);
  exigirEstado(viaje, ESTADO_VIAJE.EN_DEPOSITO, 'Solo se puede modificar un viaje que todavia no salio');

  const cambios = tomarCampos(datos, ['vehiculo_id', 'conductor_id']);
  if (cambios.vehiculo_id && Number(cambios.vehiculo_id) !== viaje.vehiculo_id) {
    await validarVehiculo(cambios.vehiculo_id, viaje.id);
  }
  if (cambios.conductor_id && Number(cambios.conductor_id) !== viaje.conductor_id) {
    await validarConductor(cambios.conductor_id, viaje.id);
  }

  await viaje.update({ ...cambios, modificado_por: usuarioId });
  return obtenerPorId(id);
}

async function eliminar(id, usuarioId) {
  const viaje = await buscarViaje(id);
  exigirEstado(viaje, ESTADO_VIAJE.EN_DEPOSITO, 'Solo se puede eliminar un viaje que todavia no salio');

  // Baja logica (paranoid). Los destinos quedan asociados al viaje borrado.
  await viaje.update({ modificado_por: usuarioId });
  await viaje.destroy();
}

// ---- Administrador: destinos de un viaje (solo mientras esta "En Deposito") ----

async function agregarDestino(viajeId, datos, usuarioId) {
  const viaje = await buscarViaje(viajeId);
  exigirEstado(viaje, ESTADO_VIAJE.EN_DEPOSITO, 'Solo se pueden agregar destinos a un viaje que todavia no salio');

  const cantidad = await db.Destino.count({ where: { viaje_id: viajeId } });
  if (cantidad >= LIMITES.PARADAS_POR_VIAJE) {
    throw new AppError(`Un viaje no puede tener mas de ${LIMITES.PARADAS_POR_VIAJE} destinos.`, 409);
  }

  const nuevo = tomarCampos(datos, CAMPOS_DESTINO);
  if (nuevo.orden === undefined) {
    const maximo = await db.Destino.max('orden', { where: { viaje_id: viajeId } });
    nuevo.orden = (maximo || 0) + 1;
  } else if (await db.Destino.findOne({ where: { viaje_id: viajeId, orden: nuevo.orden } })) {
    throw new AppError(`Ya hay un destino con el orden ${nuevo.orden} en este viaje.`, 409);
  }

  const destino = await db.Destino.create({ ...nuevo, viaje_id: viajeId });
  await viaje.update({ modificado_por: usuarioId });
  return destino;
}

async function actualizarDestino(viajeId, destinoId, datos, usuarioId) {
  const viaje = await buscarViaje(viajeId);
  exigirEstado(viaje, ESTADO_VIAJE.EN_DEPOSITO, 'Solo se pueden modificar destinos de un viaje que todavia no salio');

  const destino = await buscarDestino(viajeId, destinoId);
  const cambios = tomarCampos(datos, CAMPOS_DESTINO);

  if (cambios.orden !== undefined && Number(cambios.orden) !== destino.orden) {
    const ocupado = await db.Destino.findOne({ where: { viaje_id: viajeId, orden: cambios.orden } });
    if (ocupado) throw new AppError(`Ya hay un destino con el orden ${cambios.orden} en este viaje.`, 409);
  }

  await destino.update(cambios);
  await viaje.update({ modificado_por: usuarioId });
  return destino;
}

async function eliminarDestino(viajeId, destinoId, usuarioId) {
  const viaje = await buscarViaje(viajeId);
  exigirEstado(viaje, ESTADO_VIAJE.EN_DEPOSITO, 'Solo se pueden quitar destinos de un viaje que todavia no salio');

  const destino = await buscarDestino(viajeId, destinoId);
  const cantidad = await db.Destino.count({ where: { viaje_id: viajeId } });
  if (cantidad <= 1) {
    throw new AppError('Un viaje no puede quedar sin destinos. Elimine el viaje completo.', 409);
  }

  await destino.destroy();
  await viaje.update({ modificado_por: usuarioId });
}

// ---- Conductor: registro del recorrido ----

async function registrarSalida(id, kmSalida, usuario) {
  const viaje = await buscarViaje(id);
  await verificarAcceso(viaje, usuario);
  exigirEstado(viaje, ESTADO_VIAJE.EN_DEPOSITO, 'El viaje ya salio');

  // Se re-chequea al momento de salir: la VTV o la licencia pueden haber
  // vencido entre que se armo la hoja de ruta y el dia del viaje.
  const vehiculo = await db.Vehiculo.findByPk(viaje.vehiculo_id);
  if (vehiculo.estado !== ESTADO_VEHICULO.ACTIVO) {
    throw new AppError(`El vehiculo no esta activo (estado: ${vehiculo.estado}).`, 409);
  }
  if (vehiculo.vencimiento_vtv < hoy()) {
    throw new AppError('El vehiculo tiene la VTV vencida, no puede salir.', 409);
  }
  const conductor = await db.Conductor.findByPk(viaje.conductor_id);
  if (conductor.vencimiento_licencia < hoy()) {
    throw new AppError('Tu licencia de conducir esta vencida, no podes salir.', 409);
  }

  // Auditoria del vehiculo: el km no puede ser menor al del ultimo regreso.
  const ultimoKm = await db.Viaje.max('km_regreso', { where: { vehiculo_id: viaje.vehiculo_id } });
  if (ultimoKm !== null && kmSalida < ultimoKm) {
    throw new AppError(`El kilometraje de salida no puede ser menor al ultimo registrado (${ultimoKm} km).`, 400);
  }

  await db.sequelize.transaction(async (t) => {
    await viaje.update(
      {
        estado_id: await estadoId(ESTADO_VIAJE.EN_VIAJE, t),
        km_salida: kmSalida,
        fecha_salida: new Date(),
        modificado_por: usuario.id,
      },
      { transaction: t }
    );
    await conductor.update(
      { disponibilidad: DISPONIBILIDAD.EN_VIAJE, modificado_por: usuario.id },
      { transaction: t }
    );
  });

  return obtenerPorId(id);
}

async function registrarEntrega(viajeId, destinoId, datos, usuario) {
  const viaje = await buscarViaje(viajeId);
  await verificarAcceso(viaje, usuario);
  exigirEstado(viaje, ESTADO_VIAJE.EN_VIAJE, 'Solo se registran entregas con el viaje en curso');

  const destino = await buscarDestino(viajeId, destinoId);
  if (destino.estado_entrega !== ESTADO_ENTREGA.PENDIENTE) {
    throw new AppError(`Este destino ya fue marcado como "${destino.estado_entrega}".`, 409);
  }

  let motivoId = null;
  let detalleMotivo = null;
  if (datos.estado_entrega === ESTADO_ENTREGA.NO_ENTREGADO) {
    if (!datos.motivo_id) {
      throw new AppError('Para marcar un destino como "No entregado" hay que indicar el motivo.', 400);
    }
    const motivo = await db.MotivoNoEntrega.findByPk(datos.motivo_id);
    if (!motivo) throw new AppError('El motivo de no entrega no existe.', 404);
    motivoId = motivo.id;

    // "Otro" es para lo que no esta en la lista: el conductor tiene que
    // contar brevemente que paso. Con los demas motivos no hace falta.
    if (motivo.descripcion === MOTIVO_OTRO) {
      detalleMotivo = datos.detalle_motivo?.trim();
      if (!detalleMotivo) {
        throw new AppError('Si el motivo es "Otro", contá brevemente qué pasó.', 400);
      }
    }
  }

  await db.sequelize.transaction(async (t) => {
    await destino.update(
      {
        estado_entrega: datos.estado_entrega,
        fecha_entrega: new Date(), // la hora la pone el servidor, no el celular del conductor
        motivo_id: motivoId,
        detalle_motivo: detalleMotivo,
      },
      { transaction: t }
    );

    // Si ya no queda ninguna parada pendiente, el viaje pasa a "Entregado".
    const pendientes = await db.Destino.count({
      where: { viaje_id: viajeId, estado_entrega: ESTADO_ENTREGA.PENDIENTE },
      transaction: t,
    });
    const cambios = { modificado_por: usuario.id };
    if (pendientes === 0) cambios.estado_id = await estadoId(ESTADO_VIAJE.ENTREGADO, t);
    await viaje.update(cambios, { transaction: t });
  });

  return obtenerPorId(viajeId);
}

async function registrarRegreso(id, kmRegreso, usuario) {
  const viaje = await buscarViaje(id);
  await verificarAcceso(viaje, usuario);
  exigirEstado(viaje, ESTADO_VIAJE.ENTREGADO, 'Para registrar el regreso todos los destinos tienen que estar resueltos');

  if (kmRegreso < viaje.km_salida) {
    throw new AppError(`El kilometraje de regreso no puede ser menor al de salida (${viaje.km_salida} km).`, 400);
  }

  await db.sequelize.transaction(async (t) => {
    await viaje.update(
      {
        estado_id: await estadoId(ESTADO_VIAJE.FINALIZADO, t),
        km_regreso: kmRegreso,
        fecha_regreso: new Date(),
        modificado_por: usuario.id,
      },
      { transaction: t }
    );
    await db.Conductor.update(
      { disponibilidad: DISPONIBILIDAD.DISPONIBLE, modificado_por: usuario.id },
      { where: { id: viaje.conductor_id }, transaction: t }
    );
  });

  return obtenerPorId(id);
}

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  agregarDestino,
  actualizarDestino,
  eliminarDestino,
  registrarSalida,
  registrarEntrega,
  registrarRegreso,
  tieneViajeActivo,
};
