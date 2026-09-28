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

module.exports = { login, me };
