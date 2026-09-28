'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Destino = sequelize.define(
    'Destino',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      viaje_id: { type: DataTypes.INTEGER, allowNull: false },
      motivo_id: { type: DataTypes.INTEGER, allowNull: true },
      direccion_farmacia: { type: DataTypes.STRING(200), allowNull: false },
      cantidad_bultos: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      orden: { type: DataTypes.INTEGER, allowNull: false },
      estado_entrega: {
        type: DataTypes.ENUM('Pendiente', 'Entregado', 'No entregado'),
        allowNull: false,
        defaultValue: 'Pendiente',
      },
    },
    {
      tableName: 'destinos',
      underscored: true,
      timestamps: false, // Destino no lleva auditoria propia (ver DER: se resguarda por Viaje)
    }
  );
  return Destino;
};
