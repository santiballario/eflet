'use strict';

// Paradas de un viaje. Es una entidad debil: no tiene sentido sin su viaje.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('destinos', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      viaje_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'viajes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // entidad debil: si se borra el viaje, se borran sus paradas
      },
      motivo_id: {
        type: Sequelize.INTEGER,
        allowNull: true, // solo se completa cuando la entrega es "No entregado"
        references: { model: 'motivos_no_entrega', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      direccion_farmacia: { type: Sequelize.STRING(200), allowNull: false },
      cantidad_bultos: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      orden: { type: Sequelize.INTEGER, allowNull: false },
      estado_entrega: {
        type: Sequelize.ENUM('Pendiente', 'Entregado', 'No entregado'),
        allowNull: false,
        defaultValue: 'Pendiente',
      },
    });

    // Dos paradas del mismo viaje no pueden tener el mismo numero de orden.
    await queryInterface.addIndex('destinos', ['viaje_id', 'orden'], {
      unique: true,
      name: 'destinos_viaje_orden_unico',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('destinos');
  },
};
