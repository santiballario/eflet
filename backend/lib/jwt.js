// Firma y verificacion de JWT. El token lleva solo lo minimo indispensable
// (id y rol) - nunca datos sensibles, porque el payload de un JWT NO esta
// encriptado, solo firmado (cualquiera puede leerlo, no puede modificarlo).
const jwt = require('jsonwebtoken');

function generarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
}

function verificarToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { generarToken, verificarToken };
