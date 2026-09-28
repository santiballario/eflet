'use strict';

// Valores fijos del dominio (ver domain/estados.js y el DER).
const ESTADOS = ['En Depósito', 'En Viaje', 'Entregado', 'Finalizado'];
const MOTIVOS = ['Local cerrado', 'Dirección incorrecta', 'Rechazado por el cliente'];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      'estados_viaje',
      ESTADOS.map((descripcion) => ({ descripcion }))
    );
    await queryInterface.bulkInsert(
      'motivos_no_entrega',
      MOTIVOS.map((descripcion) => ({ descripcion }))
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('motivos_no_entrega', { descripcion: MOTIVOS });
    await queryInterface.bulkDelete('estados_viaje', { descripcion: ESTADOS });
  },
};
