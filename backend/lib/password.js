// Hashing de contraseñas con bcrypt. Nunca se guarda ni se compara texto
// plano en ningun otro lugar del codigo - siempre pasa por aca.
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

async function comparePassword(plainPassword, hash) {
  return bcrypt.compare(plainPassword, hash);
}

module.exports = { hashPassword, comparePassword };
