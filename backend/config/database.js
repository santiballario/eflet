// Configuracion de la conexion a MySQL usando variables de entorno.
// Nunca hardcodeamos usuario/contraseña/host directo en el codigo: si el
// .env falta o esta mal, preferimos que el servidor no arranque a que
// arranque con un valor por defecto inseguro (ver validacion en server.js).
//
// La usan tanto la app (models/index.js) como sequelize-cli para correr
// las migraciones. Hay un entorno por cada base (Clase 14 - Entornos):
//   development -> la base con la que trabajamos (DB_NAME)
//   test        -> una base aparte para los tests automaticos, que se
//                  puede borrar sin miedo (DB_NAME_TEST)
require('dotenv').config();

const base = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'mysql',
  logging: false,
  // Registra en la tabla SequelizeData que seeders ya se corrieron, para
  // que "db:seed:all" no inserte los datos dos veces.
  seederStorage: 'sequelize',
};

module.exports = {
  development: {
    ...base,
    database: process.env.DB_NAME,
  },
  test: {
    ...base,
    database: process.env.DB_NAME_TEST || `${process.env.DB_NAME}_test`,
  },
};
