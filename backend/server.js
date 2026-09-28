// Punto de arranque real: valida el entorno, conecta la base y levanta
// el servidor HTTP. Separado de app.js para poder testear la app sola.
require('dotenv').config();

const REQUIRED_ENV = ['DB_HOST', 'DB_NAME', 'DB_USER', 'JWT_SECRET', 'CORS_ORIGIN'];
const faltantes = REQUIRED_ENV.filter((key) => !process.env[key]);

if (faltantes.length > 0) {
  console.error(
    `Faltan variables de entorno obligatorias en .env: ${faltantes.join(', ')}`
  );
  console.error('Copia .env.example a .env y completa los valores.');
  process.exit(1);
}

const app = require('./app');
const db = require('./models');

const PORT = process.env.PORT || 3000;

db.sequelize
  .authenticate()
  .then(() => {
    console.log('Conexion a MySQL OK');
    app.listen(PORT, () => {
      console.log(`API de eFlet corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('No se pudo conectar a la base de datos:', err.message);
    process.exit(1);
  });
