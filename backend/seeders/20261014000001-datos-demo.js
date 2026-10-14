'use strict';

// Datos de ejemplo para que la app no arranque vacia: vehiculos, conductores
// y viajes en todos los estados, con sus paradas. Sirven para la demo y para
// que cualquiera que levante el proyecto (por ejemplo con Docker) vea el
// sistema funcionando sin cargar nada a mano.
//
// Las fechas se calculan a partir del dia en que se corre el seeder, asi el
// Panel de Control siempre muestra algo (viaje en curso hoy, VTV por vencer).
//
// No se cargan en la base de los tests: los tests crean sus propios datos.
//
// Conductores de prueba (todos con la contraseña Conductor123!):
//   martin.gomez@eflet.com   -> tiene un viaje En Viaje
//   lucia.fernandez@eflet.com -> tiene un viaje En Depósito, listo para salir
//   diego.sosa@eflet.com     -> solo viajes finalizados
const { hashPassword } = require('../lib/password');
const { test: configTest } = require('../config/database');

const VEHICULOS = [
  { patente: 'AE512KT', marca: 'Renault', modelo: 'Kangoo', cantidad_maxima: 650, vtvEnDias: 300, estado: 'Activo' },
  { patente: 'AF390LM', marca: 'Fiat', modelo: 'Fiorino', cantidad_maxima: 500, vtvEnDias: 20, estado: 'Activo' },
  { patente: 'AD874RP', marca: 'Peugeot', modelo: 'Partner', cantidad_maxima: 800, vtvEnDias: 400, estado: 'Activo' },
  { patente: 'AC215WN', marca: 'Citroën', modelo: 'Berlingo', cantidad_maxima: 700, vtvEnDias: 180, estado: 'En mantenimiento' },
  { patente: 'AG603BX', marca: 'Renault', modelo: 'Master', cantidad_maxima: 1200, vtvEnDias: 240, estado: 'Activo' },
];

const CONDUCTORES = [
  { email: 'martin.gomez@eflet.com', nombre: 'Martín', apellido: 'Gómez', dni: '33456789', telefono: '221-4567890', nro_licencia: 'LP-3345678', licenciaEnDias: 700, disponibilidad: 'En viaje' },
  { email: 'lucia.fernandez@eflet.com', nombre: 'Lucía', apellido: 'Fernández', dni: '35987654', telefono: '221-5123456', nro_licencia: 'LP-3598765', licenciaEnDias: 500, disponibilidad: 'Disponible' },
  { email: 'diego.sosa@eflet.com', nombre: 'Diego', apellido: 'Sosa', dni: '31222333', telefono: '221-6234567', nro_licencia: 'LP-3122233', licenciaEnDias: 90, disponibilidad: 'Disponible' },
];

const FARMACIAS = {
  central: 'Farmacia Central - Calle 7 N° 1234, La Plata',
  bosque: 'Farmacia del Bosque - Av. 1 N° 520, La Plata',
  norte: 'Farmacia Norte - Calle 13 N° 845, La Plata',
  plaza: 'Farmacia Plaza Moreno - Calle 50 N° 610, La Plata',
  city: 'Farmacia City Bell - Calle 473 N° 1520, City Bell',
  gonnet: 'Farmacia Gonnet - Camino Centenario N° 2890, Gonnet',
  tolosa: 'Farmacia Tolosa - Calle 528 N° 1150, Tolosa',
  berisso: 'Farmacia Berisso - Av. Montevideo N° 980, Berisso',
};

// Hoy + n dias, como 'YYYY-MM-DD' (para los DATEONLY de VTV y licencia)
function fechaEnDias(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

// Hace n dias, a la hora indicada de Argentina (UTC-3), para salidas y
// regresos. Se calcula en UTC para que de lo mismo en la compu o en Docker,
// que tienen zonas horarias distintas.
const ARGENTINA = -3;
function haceDias(n, hora, minutos = 0) {
  const ahoraEnArgentina = new Date(Date.now() + ARGENTINA * 3600000);
  const d = new Date(Date.UTC(
    ahoraEnArgentina.getUTCFullYear(),
    ahoraEnArgentina.getUTCMonth(),
    ahoraEnArgentina.getUTCDate() - n,
    hora - ARGENTINA,
    minutos
  ));
  return d;
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
    for (const nombre of ['En Depósito', 'En Viaje', 'Entregado', 'Finalizado']) {
      estado[nombre] = await idDe(queryInterface, 'SELECT id FROM estados_viaje WHERE descripcion = ?', nombre);
    }
    const localCerrado = await idDe(queryInterface, 'SELECT id FROM motivos_no_entrega WHERE descripcion = ?', 'Local cerrado');
    const direccionIncorrecta = await idDe(queryInterface, 'SELECT id FROM motivos_no_entrega WHERE descripcion = ?', 'Dirección incorrecta');

    // ---- Vehiculos
    await queryInterface.bulkInsert('vehiculos', VEHICULOS.map((v) => ({
      patente: v.patente,
      marca: v.marca,
      modelo: v.modelo,
      cantidad_maxima: v.cantidad_maxima,
      vencimiento_vtv: fechaEnDias(v.vtvEnDias),
      estado: v.estado,
      modificado_por: adminId,
    })));
    const vehiculo = {};
    for (const v of VEHICULOS) {
      vehiculo[v.patente] = await idDe(queryInterface, 'SELECT id FROM vehiculos WHERE patente = ?', v.patente);
    }

    // ---- Conductores: Usuario (login) + Persona + Conductor
    const passwordHash = await hashPassword('Conductor123!');
    const conductor = {};
    for (const c of CONDUCTORES) {
      await queryInterface.bulkInsert('usuarios', [
        { email: c.email, password_hash: passwordHash, rol: 'Conductor', modificado_por: adminId },
      ]);
      const usuarioId = await idDe(queryInterface, 'SELECT id FROM usuarios WHERE email = ?', c.email);
      await queryInterface.bulkInsert('personas', [
        { usuario_id: usuarioId, nombre: c.nombre, apellido: c.apellido, dni: c.dni, telefono: c.telefono, modificado_por: adminId },
      ]);
      await queryInterface.bulkInsert('conductores', [
        {
          usuario_id: usuarioId,
          nro_licencia: c.nro_licencia,
          vencimiento_licencia: fechaEnDias(c.licenciaEnDias),
          disponibilidad: c.disponibilidad,
          modificado_por: adminId,
        },
      ]);
      conductor[c.email] = await idDe(queryInterface, 'SELECT id FROM conductores WHERE usuario_id = ?', usuarioId);
    }

    // ---- Viajes con sus paradas
    const VIAJES = [
      {
        // Finalizado hace 2 dias, con una parada que no se pudo entregar
        patente: 'AD874RP', email: 'diego.sosa@eflet.com', estado: 'Finalizado',
        creado: haceDias(2, 7, 30), salida: haceDias(2, 8, 15), regreso: haceDias(2, 15, 40),
        km_salida: 45200, km_regreso: 45318,
        destinos: [
          { direccion: FARMACIAS.central, bultos: 4, entrega: 'Entregado' },
          { direccion: FARMACIAS.gonnet, bultos: 2, entrega: 'No entregado', motivo: localCerrado },
          { direccion: FARMACIAS.city, bultos: 3, entrega: 'Entregado' },
        ],
      },
      {
        // Finalizado ayer, todo entregado
        patente: 'AE512KT', email: 'lucia.fernandez@eflet.com', estado: 'Finalizado',
        creado: haceDias(1, 7, 45), salida: haceDias(1, 8, 30), regreso: haceDias(1, 13, 10),
        km_salida: 12040, km_regreso: 12105,
        destinos: [
          { direccion: FARMACIAS.plaza, bultos: 5, entrega: 'Entregado' },
          { direccion: FARMACIAS.tolosa, bultos: 2, entrega: 'Entregado' },
        ],
      },
      {
        // Finalizado ayer, con una direccion equivocada
        patente: 'AG603BX', email: 'diego.sosa@eflet.com', estado: 'Finalizado',
        creado: haceDias(1, 9, 0), salida: haceDias(1, 9, 40), regreso: haceDias(1, 16, 5),
        km_salida: 30380, km_regreso: 30462,
        destinos: [
          { direccion: FARMACIAS.berisso, bultos: 6, entrega: 'No entregado', motivo: direccionIncorrecta },
          { direccion: FARMACIAS.norte, bultos: 3, entrega: 'Entregado' },
        ],
      },
      {
        // En viaje hoy: una parada entregada y dos pendientes
        patente: 'AG603BX', email: 'martin.gomez@eflet.com', estado: 'En Viaje',
        creado: haceDias(0, 7, 30), salida: haceDias(0, 8, 0),
        km_salida: 30470,
        destinos: [
          { direccion: FARMACIAS.bosque, bultos: 3, entrega: 'Entregado' },
          { direccion: FARMACIAS.norte, bultos: 2, entrega: 'Pendiente' },
          { direccion: FARMACIAS.city, bultos: 4, entrega: 'Pendiente' },
        ],
      },
      {
        // Armado y esperando en el deposito: el conductor todavia no salio
        patente: 'AE512KT', email: 'lucia.fernandez@eflet.com', estado: 'En Depósito',
        creado: haceDias(0, 9, 15),
        destinos: [
          { direccion: FARMACIAS.central, bultos: 2, entrega: 'Pendiente' },
          { direccion: FARMACIAS.tolosa, bultos: 5, entrega: 'Pendiente' },
        ],
      },
    ];

    for (const v of VIAJES) {
      await queryInterface.bulkInsert('viajes', [
        {
          vehiculo_id: vehiculo[v.patente],
          conductor_id: conductor[v.email],
          usuario_creador_id: adminId,
          estado_id: estado[v.estado],
          fecha_salida: v.salida ?? null,
          fecha_regreso: v.regreso ?? null,
          km_salida: v.km_salida ?? null,
          km_regreso: v.km_regreso ?? null,
          modificado_por: adminId,
          fecha_creacion: v.creado,
          fecha_modificacion: v.regreso ?? v.salida ?? v.creado,
        },
      ]);
      const [[{ id: viajeId }]] = await queryInterface.sequelize.query('SELECT MAX(id) AS id FROM viajes');
      await queryInterface.bulkInsert('destinos', v.destinos.map((d, i) => ({
        viaje_id: viajeId,
        orden: i + 1,
        direccion_farmacia: d.direccion,
        cantidad_bultos: d.bultos,
        estado_entrega: d.entrega,
        motivo_id: d.motivo ?? null,
      })));
    }
  },

  async down(queryInterface) {
    const patentes = VEHICULOS.map((v) => v.patente);
    const emails = CONDUCTORES.map((c) => c.email);
    // Orden inverso al de creacion, por las claves foraneas
    await queryInterface.sequelize.query(
      'DELETE d FROM destinos d JOIN viajes v ON v.id = d.viaje_id JOIN vehiculos ve ON ve.id = v.vehiculo_id WHERE ve.patente IN (?)',
      { replacements: [patentes] }
    );
    await queryInterface.sequelize.query(
      'DELETE v FROM viajes v JOIN vehiculos ve ON ve.id = v.vehiculo_id WHERE ve.patente IN (?)',
      { replacements: [patentes] }
    );
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
