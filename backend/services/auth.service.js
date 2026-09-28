// Logica de negocio de autenticacion. Separada del controller para que
// este ultimo solo se ocupe de "traducir" HTTP <-> service.
const db = require('../models');
const { comparePassword } = require('../lib/password');
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

module.exports = { login };
