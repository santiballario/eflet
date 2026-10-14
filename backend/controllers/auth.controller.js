const authService = require('../services/auth.service');
const asyncHandler = require('../lib/async-handler');

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const resultado = await authService.login(email, password);
  res.json(resultado);
});

// GET /api/auth/me -> perfil del usuario del token: rol, nombre, contacto
// y, si es conductor, su licencia.
const me = asyncHandler(async (req, res) => {
  const usuario = await authService.perfil(req.usuario.id);
  res.json({ usuario });
});

// PATCH /api/auth/me -> el usuario actualiza su telefono
const actualizarPerfil = asyncHandler(async (req, res) => {
  const usuario = await authService.actualizarPerfil(req.usuario.id, req.body);
  res.json({ usuario });
});

// PUT /api/auth/password -> el usuario logueado cambia su contraseña
const cambiarPassword = asyncHandler(async (req, res) => {
  const { password_actual, password_nueva } = req.body;
  await authService.cambiarPassword(req.usuario.id, password_actual, password_nueva);
  res.json({ mensaje: 'Contraseña actualizada.' });
});

module.exports = { login, me, actualizarPerfil, cambiarPassword };
