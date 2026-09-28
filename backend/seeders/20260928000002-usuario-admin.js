'use strict';

// Usuario Administrador de prueba, para poder loguearse en un entorno recien
// creado. Solo para desarrollo: en produccion se crearia con otra clave.
//   email: admin@eflet.com   password: Admin123!
const { hashPassword } = require('../lib/password');

const EMAIL = 'admin@eflet.com';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('usuarios', [
      { email: EMAIL, password_hash: await hashPassword('Admin123!'), rol: 'Administrador' },
    ]);

    const [[admin]] = await queryInterface.sequelize.query('SELECT id FROM usuarios WHERE email = ?', {
      replacements: [EMAIL],
    });

    await queryInterface.bulkInsert('personas', [
      { usuario_id: admin.id, nombre: 'Admin', apellido: 'eFlet', dni: '00000000', telefono: '000-0000000' },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      'DELETE p FROM personas p JOIN usuarios u ON u.id = p.usuario_id WHERE u.email = ?',
      { replacements: [EMAIL] }
    );
    await queryInterface.bulkDelete('usuarios', { email: EMAIL });
  },
};
