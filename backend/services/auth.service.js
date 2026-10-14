// Logica de negocio de autenticacion. Separada del controller para que
// este ultimo solo se ocupe de "traducir" HTTP <-> service.
const db = require('../models');
const { comparePassword, hashPassword } = require('../lib/password');
const { generarToken } = require('../lib/jwt');
const { AppError } = require('../lib/errors');

async function login(email, password) {
  // paranoid:true (soft delete) hace que findOne ya ignore usuarios con
  // fecha_eliminacion seteada - no hace falta filtrarlo a mano.
  const usuario = await db.Usuario.findOne({ where: { email } });

  // Mensaje generico a proposito: no decimos "el email no existe" para no
  // darle pistas a quien intenta adivinar cuentas validas.
  if (!usuario) {
    throw new AppError('Email o contraseña incorrectos.', 401);
  }

  const passwordOk = await comparePassword(password, usuario.password_hash);
  if (!passwordOk) {
    throw new AppError('Email o contraseña incorrectos.', 401);
  }

  const token = generarToken(usuario);

  return {
    token,
    usuario: {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    },
  };
}

// El usuario logueado cambia su propia contraseña. Se pide la actual para
// que alguien que encuentre la sesion abierta no pueda cambiarla.
async function cambiarPassword(usuarioId, passwordActual, passwordNueva) {
  const usuario = await db.Usuario.findByPk(usuarioId);
  if (!usuario) {
    throw new AppError('Usuario no encontrado.', 404);
  }

  const passwordOk = await comparePassword(passwordActual, usuario.password_hash);
  if (!passwordOk) {
    // 400 y no 401: el token es valido, lo que esta mal es un dato del
    // formulario. (Un 401 haria que el frontend cierre la sesion.)
    throw new AppError('La contraseña actual es incorrecta.', 400);
  }

  usuario.password_hash = await hashPassword(passwordNueva);
  usuario.modificado_por = usuarioId;
  await usuario.save();
}

module.exports = { login, cambiarPassword };
