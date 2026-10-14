// Logica de negocio de autenticacion. Separada del controller para que
// este ultimo solo se ocupe de "traducir" HTTP <-> service.
const db = require('../models');
const { comparePassword, hashPassword } = require('../lib/password');
const { generarToken } = require('../lib/jwt');
const { AppError } = require('../lib/errors');
const tomarCampos = require('../lib/tomar-campos');

async function login(email, password) {
  // paranoid:true (soft delete) hace que findOne ya ignore usuarios con
  // fecha_eliminacion seteada - no hace falta filtrarlo a mano.
  const usuario = await db.Usuario.findOne({ where: { email }, include: [db.Persona] });

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
      // El nombre se usa en el saludo ("Bienvenido, Martín")
      nombre: usuario.Persona?.nombre ?? null,
      apellido: usuario.Persona?.apellido ?? null,
    },
  };
}

// Arma el perfil que ve el propio usuario: nunca incluye el hash de la
// contraseña. Los datos de licencia solo existen si es Conductor.
function armarPerfil(usuario) {
  const persona = usuario.Persona;
  const conductor = usuario.Conductor;
  return {
    id: usuario.id,
    email: usuario.email,
    rol: usuario.rol,
    nombre: persona?.nombre ?? null,
    apellido: persona?.apellido ?? null,
    dni: persona?.dni ?? null,
    telefono: persona?.telefono ?? null,
    conductor: conductor
      ? {
          nro_licencia: conductor.nro_licencia,
          vencimiento_licencia: conductor.vencimiento_licencia,
          disponibilidad: conductor.disponibilidad,
        }
      : null,
  };
}

// Perfil del usuario logueado (GET /auth/me). Se busca en la base y no solo
// en el token: si la cuenta se dio de baja, el token deja de servir aca.
async function perfil(usuarioId) {
  const usuario = await db.Usuario.findByPk(usuarioId, { include: [db.Persona, db.Conductor] });
  if (!usuario) {
    throw new AppError('La cuenta ya no existe.', 401);
  }
  return armarPerfil(usuario);
}

// El usuario solo puede cambiar su telefono. Email, nombre, DNI y licencia
// los administra la empresa (el email ademas es con lo que inicia sesion).
const CAMPOS_EDITABLES = ['telefono'];

async function actualizarPerfil(usuarioId, datos) {
  const persona = await db.Persona.findOne({ where: { usuario_id: usuarioId } });
  if (!persona) {
    throw new AppError('Perfil no encontrado.', 404);
  }

  Object.assign(persona, tomarCampos(datos, CAMPOS_EDITABLES));
  persona.modificado_por = usuarioId;
  await persona.save();

  return perfil(usuarioId);
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

module.exports = { login, perfil, actualizarPerfil, cambiarPassword };
