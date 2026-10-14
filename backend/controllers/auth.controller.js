const authService = require('../services/auth.service');
const asyncHandler = require('../lib/async-handler');

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const resultado = await authService.login(email, password);
  res.json(resultado);
});

// GET /api/auth/me -> devuelve quien es el usuario del token actual
// (util para que el frontend sepa que rol tiene sin decodificar el JWT).
const me = asyncHandler(async (req, res) => {
  res.json({ usuario: req.usuario });
});

// PUT /api/auth/password -> el usuario logueado cambia su contraseña
const cambiarPassword = asyncHandler(async (req, res) => {
  const { password_actual, password_nueva } = req.body;
  await authService.cambiarPassword(req.usuario.id, password_actual, password_nueva);
  res.json({ mensaje: 'Contraseña actualizada.' });
});

module.exports = { login, me, cambiarPassword };
