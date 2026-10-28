// Arma la app de Express: seguridad basica, rutas y manejo de errores.
// No levanta el servidor (eso lo hace server.js) - separado para poder
// testear la app sin necesidad de un puerto real abierto.
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const errorHandler = require('./middlewares/error-handler');

const app = express();

// Cabeceras de seguridad por defecto (quita X-Powered-By, etc.)
app.use(helmet());

// CORS restringido a un unico origen - nunca "*"
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// Limite de tamaño de body para evitar payloads gigantes
app.use(express.json({ limit: '10kb' }));

// Rate limiting general para toda la API
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 1000, // cada pantalla hace varios pedidos: con 200 se llegaba usando la app normal
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api', require('./routes'));

// Cualquier ruta que no matcheo nada de arriba -> 404 prolijo, en vez de
// dejar que Express devuelva un HTML feo por defecto.
app.use((req, res, next) => {
  res.status(404).json({
    error: true,
    mensaje: 'Ruta no encontrada.',
    codigo: 404,
  });
});

// Siempre al final: captura cualquier error no manejado y responde con
// el formato estandar { error, mensaje, codigo }.
app.use(errorHandler);

module.exports = app;
