// Configuracion de la conexion a MySQL usando variables de entorno.
// Nunca hardcodeamos usuario/contraseña/host directo en el codigo: si el
// .env falta o esta mal, preferimos que el servidor no arranque a que
// arranque con un valor por defecto inseguro (ver validacion en server.js).
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
  },
};
