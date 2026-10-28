'use strict';

// Motivo de no entrega "Otro": para lo que no esta en la lista. Exige que el
// conductor escriba una descripcion (ver registrarEntrega en viaje.service.js).
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('motivos_no_entrega', [{ descripcion: 'Otro' }]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('motivos_no_entrega', { descripcion: 'Otro' });
  },
};
