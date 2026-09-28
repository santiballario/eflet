// Middleware de autenticacion: exige header "Authorization: Bearer <token>",
// valida el JWT y cuelga el usuario decodificado en req.usuario para que
// los controllers de mas adelante sepan quien esta haciendo el pedido.
const { verificarToken } = require('../lib/jwt');
const { AppError } = require('../lib/errors');

function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('No autenticado. Falta el token.', 401));
  }

  const token = header.split(' ')[1];

  try {
    const payload = verificarToken(token);
    req.usuario = { id: payload.id, rol: payload.rol };
    next();
  } catch (err) {
    next(new AppError('Token invalido o expirado.', 401));
  }
}

// Uso: requireRole('Administrador') o requireRole('Administrador', 'Conductor')
function requireRole(...rolesPermitidos) {
  return function (req, res, next) {
    if (!req.usuario) {
      return next(new AppError('No autenticado.', 401));
    }
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return next(new AppError('No tenes permiso para esta accion.', 403));
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
