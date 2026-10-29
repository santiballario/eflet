'use strict';

// Amplia los datos de ejemplo de 20261014000001-datos-demo.js con dos semanas
// de historial y los casos que la app tiene que saber mostrar. Es un seeder
// nuevo (no se modifico el anterior): igual que con las migraciones, un seeder
// que ya se corrio en alguna base no se toca.
//
// Que agrega:
//   - 4 conductores nuevos y 4 vehiculos nuevos, con estos casos:
//       sofia.ramirez@eflet.com  -> viaje de hoy en "Entregado" (falta el regreso)
//                                   y licencia que vence en 20 dias
//       pablo.acosta@eflet.com   -> ya termino un viaje hoy (el resumen "Hoy" tiene datos)
//       carla.medina@eflet.com   -> licencia vencida, "No disponible"
//       jorge.ibarra@eflet.com   -> dado de baja: sus viajes viejos lo siguen mostrando
//       AB123CD                  -> VTV vencida
//       AA999XX                  -> vehiculo dado de baja, con viajes en el historial
//   - Unos 25 viajes finalizados en los ultimos 14 dias, con paradas
//     entregadas y no entregadas con todos los motivos (incluido "Otro" con su
//     descripcion), para probar los filtros por dia y el grafico.
//
// Los km de cada vehiculo crecen en orden y quedan por debajo de los del
// seeder anterior, asi se respeta la auditoria de kilometraje.
// Todos los conductores usan la contraseña Conductor123!
// No se carga en la base de los tests.
const { hashPassword } = require('../lib/password');
const { test: configTest } = require('../config/database');

const VEHICULOS = [
  { patente: 'AB123CD', marca: 'Toyota', modelo: 'Hiace', cantidad_maxima: 1000, vtvEnDias: -5, estado: 'Activo' },
  { patente: 'AF777QR', marca: 'Ford', modelo: 'Transit', cantidad_maxima: 1100, vtvEnDias: 150, estado: 'Activo' },
  { patente: 'AH555ZT', marca: 'Peugeot', modelo: 'Boxer', cantidad_maxima: 1300, vtvEnDias: 365, estado: 'Activo' },
  { patente: 'AA999XX', marca: 'Renault', modelo: 'Trafic', cantidad_maxima: 900, vtvEnDias: 60, estado: 'Activo', bajaHaceDias: 4 },
];

const CONDUCTORES = [
  { email: 'sofia.ramirez@eflet.com', nombre: 'Sofía', apellido: 'Ramírez', dni: '38111222', telefono: '221-7012345', nro_licencia: 'LP-3811122', licenciaEnDias: 20, disponibilidad: 'En viaje' },
  { email: 'pablo.acosta@eflet.com', nombre: 'Pablo', apellido: 'Acosta', dni: '36444555', telefono: '221-7123456', nro_licencia: 'LP-3644455', licenciaEnDias: 900, disponibilidad: 'Disponible' },
  { email: 'carla.medina@eflet.com', nombre: 'Carla', apellido: 'Medina', dni: '34777888', telefono: '221-7234567', nro_licencia: 'LP-3477788', licenciaEnDias: -3, disponibilidad: 'No disponible' },
  { email: 'jorge.ibarra@eflet.com', nombre: 'Jorge', apellido: 'Ibarra', dni: '29555666', telefono: '221-7345678', nro_licencia: 'LP-2955566', licenciaEnDias: 400, disponibilidad: 'Disponible', bajaHaceDias: 5 },
];

const F = {
  central: 'Farmacia Central - Calle 7 N° 1234, La Plata',
  bosque: 'Farmacia del Bosque - Av. 1 N° 520, La Plata',
  norte: 'Farmacia Norte - Calle 13 N° 845, La Plata',
  plaza: 'Farmacia Plaza Moreno - Calle 50 N° 610, La Plata',
  city: 'Farmacia City Bell - Calle 473 N° 1520, City Bell',
  gonnet: 'Farmacia Gonnet - Camino Centenario N° 2890, Gonnet',
  tolosa: 'Farmacia Tolosa - Calle 528 N° 1150, Tolosa',
  berisso: 'Farmacia Berisso - Av. Montevideo N° 980, Berisso',
  ensenada: 'Farmacia Ensenada - Calle La Merced N° 340, Ensenada',
  hornos: 'Farmacia Los Hornos - Calle 137 N° 1710, Los Hornos',
  elisa: 'Farmacia Villa Elisa - Camino Belgrano N° 4210, Villa Elisa',
  hernandez: 'Farmacia Hernández - Calle 511 N° 2050, Hernández',
  ringuelet: 'Farmacia Ringuelet - Calle 514 N° 1430, Ringuelet',
  romero: 'Farmacia Melchor Romero - Calle 520 N° 3100, Melchor Romero',
};

// Paradas: [farmacia, bultos] = entregada; con un tercer valor = no entregada
// con ese motivo; con un cuarto, el detalle (solo para "Otro").
const VIAJES = [
  { dias: 14, email: 'diego.sosa@eflet.com', patente: 'AD874RP', paradas: [[F.central, 4], [F.gonnet, 2], [F.bosque, 3]] },
  { dias: 14, email: 'jorge.ibarra@eflet.com', patente: 'AA999XX', paradas: [[F.plaza, 5], [F.tolosa, 2, 'Local cerrado']] },
  { dias: 13, email: 'martin.gomez@eflet.com', patente: 'AG603BX', paradas: [[F.norte, 3], [F.city, 6]] },
  { dias: 13, email: 'carla.medina@eflet.com', patente: 'AF390LM', paradas: [[F.berisso, 2], [F.ensenada, 4], [F.hornos, 1]] },
  { dias: 12, email: 'lucia.fernandez@eflet.com', patente: 'AE512KT', paradas: [[F.plaza, 3], [F.central, 2]] },
  { dias: 12, email: 'jorge.ibarra@eflet.com', patente: 'AA999XX', paradas: [[F.elisa, 4], [F.hernandez, 2, 'Otro', 'Pidieron que volvamos después de las 14 h']] },
  { dias: 11, email: 'pablo.acosta@eflet.com', patente: 'AH555ZT', paradas: [[F.ringuelet, 2], [F.gonnet, 3], [F.city, 2], [F.elisa, 5]] },
  { dias: 11, email: 'diego.sosa@eflet.com', patente: 'AD874RP', paradas: [[F.tolosa, 3], [F.norte, 2, 'Rechazado por el cliente']] },
  { dias: 10, email: 'martin.gomez@eflet.com', patente: 'AG603BX', paradas: [[F.bosque, 2], [F.plaza, 4], [F.central, 3]] },
  { dias: 10, email: 'carla.medina@eflet.com', patente: 'AF390LM', paradas: [[F.romero, 2, 'Dirección incorrecta'], [F.hornos, 3]] },
  { dias: 9, email: 'lucia.fernandez@eflet.com', patente: 'AE512KT', paradas: [[F.norte, 2], [F.tolosa, 4], [F.berisso, 1]] },
  { dias: 9, email: 'jorge.ibarra@eflet.com', patente: 'AA999XX', paradas: [[F.ensenada, 3], [F.berisso, 2]] },
  { dias: 8, email: 'pablo.acosta@eflet.com', patente: 'AH555ZT', paradas: [[F.city, 4], [F.gonnet, 2]] },
  { dias: 8, email: 'diego.sosa@eflet.com', patente: 'AD874RP', paradas: [[F.central, 5], [F.plaza, 2], [F.bosque, 3, 'Otro', 'El encargado no estaba y nadie pudo recibir el pedido']] },
  { dias: 7, email: 'martin.gomez@eflet.com', patente: 'AG603BX', paradas: [[F.hernandez, 2], [F.ringuelet, 3]] },
  { dias: 7, email: 'sofia.ramirez@eflet.com', patente: 'AF777QR', paradas: [[F.elisa, 3], [F.city, 2], [F.gonnet, 4]] },
  { dias: 6, email: 'lucia.fernandez@eflet.com', patente: 'AE512KT', paradas: [[F.central, 2], [F.norte, 3]] },
  { dias: 6, email: 'carla.medina@eflet.com', patente: 'AF390LM', paradas: [[F.plaza, 4], [F.tolosa, 2]] },
  { dias: 5, email: 'pablo.acosta@eflet.com', patente: 'AH555ZT', paradas: [[F.hornos, 2], [F.romero, 3], [F.central, 1, 'Local cerrado']] },
  { dias: 5, email: 'sofia.ramirez@eflet.com', patente: 'AF777QR', paradas: [[F.berisso, 5], [F.ensenada, 2]] },
  { dias: 4, email: 'martin.gomez@eflet.com', patente: 'AG603BX', paradas: [[F.bosque, 3], [F.norte, 2], [F.plaza, 2]] },
  { dias: 4, email: 'diego.sosa@eflet.com', patente: 'AD874RP', paradas: [[F.tolosa, 2], [F.city, 4, 'Rechazado por el cliente']] },
  { dias: 3, email: 'sofia.ramirez@eflet.com', patente: 'AF777QR', paradas: [[F.central, 3], [F.plaza, 2]] },
  { dias: 3, email: 'pablo.acosta@eflet.com', patente: 'AH555ZT', paradas: [[F.gonnet, 2], [F.elisa, 3], [F.hernandez, 2]] },
  // Hoy: Pablo ya volvio (el resumen "Hoy" y el Panel tienen datos)
  {
    dias: 0, email: 'pablo.acosta@eflet.com', patente: 'AH555ZT', salidaHora: 6, regresoHora: 9,
    paradas: [[F.plaza, 3], [F.bosque, 2], [F.norte, 2, 'Otro', 'Faltaba la orden de compra firmada']],
  },
  // Hoy: Sofia ya resolvio todas las paradas pero no registro el regreso -> "Entregado"
  {
    dias: 0, email: 'sofia.ramirez@eflet.com', patente: 'AF777QR', salidaHora: 7, sinRegreso: true,
    paradas: [[F.ringuelet, 2], [F.hernandez, 3], [F.elisa, 1, 'Local cerrado']],
  },
];

// Km con los que arranca el historial de cada vehiculo (por debajo de los
// del seeder anterior: AD874RP 45200, AE512KT 12040, AG603BX 30380)
const KM_INICIAL = { AD874RP: 44600, AE512KT: 11500, AG603BX: 29700, AF390LM: 18200, AA999XX: 52300, AF777QR: 8400, AH555ZT: 3100 };

function fechaEnDias(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

// Hace n dias, a la hora indicada de Argentina (UTC-3); igual que en el seeder anterior
const ARGENTINA = -3;
function haceDias(n, hora, minutos = 0) {
  const ahoraEnArgentina = new Date(Date.now() + ARGENTINA * 3600000);
  return new Date(Date.UTC(
    ahoraEnArgentina.getUTCFullYear(),
    ahoraEnArgentina.getUTCMonth(),
    ahoraEnArgentina.getUTCDate() - n,
    hora - ARGENTINA,
    minutos
  ));
}

async function idDe(queryInterface, sql, valor) {
  const [[fila]] = await queryInterface.sequelize.query(sql, { replacements: [valor] });
  return fila.id;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    if (queryInterface.sequelize.config.database === configTest.database) return;

    const adminId = await idDe(queryInterface, 'SELECT id FROM usuarios WHERE email = ?', 'admin@eflet.com');
    const estado = {};
    for (const nombre of ['Entregado', 'Finalizado']) {
      estado[nombre] = await idDe(queryInterface, 'SELECT id FROM estados_viaje WHERE descripcion = ?', nombre);
    }
    const motivo = {};
    for (const nombre of ['Local cerrado', 'Dirección incorrecta', 'Rechazado por el cliente', 'Otro']) {
      motivo[nombre] = await idDe(queryInterface, 'SELECT id FROM motivos_no_entrega WHERE descripcion = ?', nombre);
    }

    // ---- Vehiculos nuevos (uno ya dado de baja: baja logica con fecha_eliminacion)
    await queryInterface.bulkInsert('vehiculos', VEHICULOS.map((v) => ({
      patente: v.patente,
      marca: v.marca,
      modelo: v.modelo,
      cantidad_maxima: v.cantidad_maxima,
      vencimiento_vtv: fechaEnDias(v.vtvEnDias),
      estado: v.estado,
      modificado_por: adminId,
      fecha_eliminacion: v.bajaHaceDias ? haceDias(v.bajaHaceDias, 17) : null,
    })));

    // ---- Conductores nuevos: Usuario + Persona + Conductor (Jorge, dado de baja en las 3 tablas)
    const passwordHash = await hashPassword('Conductor123!');
    for (const c of CONDUCTORES) {
      const baja = c.bajaHaceDias ? haceDias(c.bajaHaceDias, 17) : null;
      await queryInterface.bulkInsert('usuarios', [
        { email: c.email, password_hash: passwordHash, rol: 'Conductor', modificado_por: adminId, fecha_eliminacion: baja },
      ]);
      const usuarioId = await idDe(queryInterface, 'SELECT id FROM usuarios WHERE email = ?', c.email);
      await queryInterface.bulkInsert('personas', [
        { usuario_id: usuarioId, nombre: c.nombre, apellido: c.apellido, dni: c.dni, telefono: c.telefono, modificado_por: adminId, fecha_eliminacion: baja },
      ]);
      await queryInterface.bulkInsert('conductores', [
        {
          usuario_id: usuarioId,
          nro_licencia: c.nro_licencia,
          vencimiento_licencia: fechaEnDias(c.licenciaEnDias),
          disponibilidad: c.disponibilidad,
          modificado_por: adminId,
          fecha_eliminacion: baja,
        },
      ]);
    }

    // Ids de todos los vehiculos y conductores que usan los viajes (nuevos y del seeder anterior)
    const vehiculo = {};
    for (const patente of Object.keys(KM_INICIAL)) {
      vehiculo[patente] = await idDe(queryInterface, 'SELECT id FROM vehiculos WHERE patente = ?', patente);
    }
    const conductor = {};
    for (const email of new Set(VIAJES.map((v) => v.email))) {
      conductor[email] = await idDe(
        queryInterface,
        'SELECT c.id FROM conductores c JOIN usuarios u ON u.id = c.usuario_id WHERE u.email = ?',
        email
      );
    }

    // ---- Viajes, del mas viejo al mas nuevo (asi los km de cada vehiculo crecen)
    const km = { ...KM_INICIAL };
    for (const [i, v] of VIAJES.entries()) {
      const salida = haceDias(v.dias, v.salidaHora ?? 8, (i * 7) % 50);
      const regreso = v.sinRegreso ? null : haceDias(v.dias, v.regresoHora ?? 13 + (i % 4), (i * 11) % 50);
      const kmSalida = km[v.patente];
      const kmRegreso = v.sinRegreso ? null : kmSalida + 35 + ((i * 17) % 90);
      if (kmRegreso) km[v.patente] = kmRegreso + 5; // unos km entre viaje y viaje

      await queryInterface.bulkInsert('viajes', [
        {
          vehiculo_id: vehiculo[v.patente],
          conductor_id: conductor[v.email],
          usuario_creador_id: adminId,
          estado_id: v.sinRegreso ? estado.Entregado : estado.Finalizado,
          fecha_salida: salida,
          fecha_regreso: regreso,
          km_salida: kmSalida,
          km_regreso: kmRegreso,
          modificado_por: adminId,
          fecha_creacion: haceDias(v.dias, (v.salidaHora ?? 8) - 1, 15),
          fecha_modificacion: regreso ?? salida,
        },
      ]);
      const [[{ id: viajeId }]] = await queryInterface.sequelize.query('SELECT MAX(id) AS id FROM viajes');
      // Hora de cada parada: repartidas entre la salida y el regreso (o cada 40 min si no volvio)
      const paso = regreso ? (regreso - salida) / (v.paradas.length + 1) : 40 * 60000;
      await queryInterface.bulkInsert('destinos', v.paradas.map(([direccion, bultos, motivoNoEntrega, detalle], orden) => ({
        viaje_id: viajeId,
        orden: orden + 1,
        direccion_farmacia: direccion,
        cantidad_bultos: bultos,
        estado_entrega: motivoNoEntrega ? 'No entregado' : 'Entregado',
        motivo_id: motivoNoEntrega ? motivo[motivoNoEntrega] : null,
        detalle_motivo: detalle ?? null,
        fecha_entrega: new Date(salida.getTime() + paso * (orden + 1)),
      })));
    }
  },

  async down(queryInterface) {
    const emails = CONDUCTORES.map((c) => c.email);
    const patentes = VEHICULOS.map((v) => v.patente);
    // Primero los viajes de este seeder: los de los conductores o vehiculos nuevos,
    // y el historial (creado hace 3 dias o mas; los del seeder anterior son de
    // los ultimos 2 dias, asi que esos no se tocan).
    const [viajes] = await queryInterface.sequelize.query(
      `SELECT v.id FROM viajes v
         JOIN conductores c ON c.id = v.conductor_id
         JOIN usuarios u ON u.id = c.usuario_id
         JOIN vehiculos ve ON ve.id = v.vehiculo_id
        WHERE u.email IN (?) OR ve.patente IN (?) OR DATE(v.fecha_creacion) <= DATE_SUB(CURDATE(), INTERVAL 3 DAY)`,
      { replacements: [emails, patentes] }
    );
    const ids = viajes.map((v) => v.id);
    if (ids.length) {
      await queryInterface.bulkDelete('destinos', { viaje_id: ids });
      await queryInterface.bulkDelete('viajes', { id: ids });
    }
    await queryInterface.sequelize.query(
      'DELETE c FROM conductores c JOIN usuarios u ON u.id = c.usuario_id WHERE u.email IN (?)',
      { replacements: [emails] }
    );
    await queryInterface.sequelize.query(
      'DELETE p FROM personas p JOIN usuarios u ON u.id = p.usuario_id WHERE u.email IN (?)',
      { replacements: [emails] }
    );
    await queryInterface.bulkDelete('usuarios', { email: emails });
    await queryInterface.bulkDelete('vehiculos', { patente: patentes });
  },
};
