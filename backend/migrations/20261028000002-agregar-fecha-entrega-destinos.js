'use strict';

// Fecha y hora en que el conductor marco la parada como Entregado o No entregado.
// Queda vacia mientras la parada esta Pendiente (y en los datos cargados antes
// de esta migracion).
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('destinos', 'fecha_entrega', {
      type: Sequelize.DATE,
      allowNull: true,
      after: 'estado_entrega',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('destinos', 'fecha_entrega');
  },
};
