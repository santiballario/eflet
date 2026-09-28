'use strict';

// Catalogos de valores fijos (sin auditoria): los llena el seeder.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('estados_viaje', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      descripcion: { type: Sequelize.STRING(30), allowNull: false, unique: true },
    });

    await queryInterface.createTable('motivos_no_entrega', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      descripcion: { type: Sequelize.STRING(100), allowNull: false, unique: true },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('motivos_no_entrega');
    await queryInterface.dropTable('estados_viaje');
  },
};
