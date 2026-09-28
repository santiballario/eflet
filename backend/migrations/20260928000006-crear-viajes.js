'use strict';

// Hoja de ruta. Salida y regreso quedan en NULL hasta que el conductor
// los registra.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Todas las FK son obligatorias (relacion 1:N con NOT NULL) y RESTRICT:
    // no se puede borrar fisicamente un vehiculo, conductor, usuario o
    // estado que tenga viajes (Clase 8 - Reglas de integridad referencial).
    const fk = (tabla) => ({
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: tabla, key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    await queryInterface.createTable('viajes', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      vehiculo_id: fk('vehiculos'),
      conductor_id: fk('conductores'),
      usuario_creador_id: fk('usuarios'),
      estado_id: fk('estados_viaje'),
      fecha_salida: { type: Sequelize.DATE, allowNull: true },
      fecha_regreso: { type: Sequelize.DATE, allowNull: true },
      km_salida: { type: Sequelize.INTEGER, allowNull: true },
      km_regreso: { type: Sequelize.INTEGER, allowNull: true },

      modificado_por: { type: Sequelize.INTEGER, allowNull: true },
      fecha_creacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      fecha_modificacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      fecha_eliminacion: { type: Sequelize.DATE, allowNull: true },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('viajes');
  },
};
