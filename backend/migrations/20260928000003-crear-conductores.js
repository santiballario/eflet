'use strict';

// Datos de conductor (licencia y disponibilidad). 1 a 1 con usuarios.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('conductores', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: 'usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      nro_licencia: { type: Sequelize.STRING(30), allowNull: false, unique: true },
      vencimiento_licencia: { type: Sequelize.DATEONLY, allowNull: false },
      disponibilidad: {
        type: Sequelize.ENUM('Disponible', 'En viaje', 'No disponible'),
        allowNull: false,
        defaultValue: 'Disponible',
      },

      modificado_por: { type: Sequelize.INTEGER, allowNull: true },
      fecha_creacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      fecha_modificacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      fecha_eliminacion: { type: Sequelize.DATE, allowNull: true },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('conductores');
  },
};
