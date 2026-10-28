'use strict';

// Cuando el motivo de no entrega es "Otro", el conductor escribe una breve
// descripcion de lo que paso. Se guarda en la parada (destino).
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('destinos', 'detalle_motivo', {
      type: Sequelize.STRING(200),
      allowNull: true,
      after: 'motivo_id',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('destinos', 'detalle_motivo');
  },
};
