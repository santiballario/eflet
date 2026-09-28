'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vehiculos', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      patente: { type: Sequelize.STRING(10), allowNull: false, unique: true },
      marca: { type: Sequelize.STRING(50), allowNull: false },
      modelo: { type: Sequelize.STRING(50), allowNull: false },
      cantidad_maxima: { type: Sequelize.DECIMAL(6, 2), allowNull: false }, // kg
      vencimiento_vtv: { type: Sequelize.DATEONLY, allowNull: false },
      estado: {
        type: Sequelize.ENUM('Activo', 'En mantenimiento', 'Baja'),
        allowNull: false,
        defaultValue: 'Activo',
      },

      modificado_por: { type: Sequelize.INTEGER, allowNull: true },
      fecha_creacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      fecha_modificacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      fecha_eliminacion: { type: Sequelize.DATE, allowNull: true },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('vehiculos');
  },
};
