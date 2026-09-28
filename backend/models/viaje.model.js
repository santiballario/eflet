'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Viaje = sequelize.define(
    'Viaje',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      vehiculo_id: { type: DataTypes.INTEGER, allowNull: false },
      conductor_id: { type: DataTypes.INTEGER, allowNull: false },
      usuario_creador_id: { type: DataTypes.INTEGER, allowNull: false },
      estado_id: { type: DataTypes.INTEGER, allowNull: false },
      fecha_salida: { type: DataTypes.DATE, allowNull: false },
      fecha_regreso: { type: DataTypes.DATE, allowNull: true },
      km_salida: { type: DataTypes.INTEGER, allowNull: false },
      km_regreso: { type: DataTypes.INTEGER, allowNull: true },
      modificado_por: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      tableName: 'viajes',
      underscored: true,
      timestamps: true,
      createdAt: 'fecha_creacion',
      updatedAt: 'fecha_modificacion',
      paranoid: true,
      deletedAt: 'fecha_eliminacion',
    }
  );
  return Viaje;
};
