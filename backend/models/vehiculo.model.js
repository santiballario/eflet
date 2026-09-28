'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Vehiculo = sequelize.define(
    'Vehiculo',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      patente: { type: DataTypes.STRING(10), allowNull: false, unique: true },
      marca: { type: DataTypes.STRING(50), allowNull: false },
      modelo: { type: DataTypes.STRING(50), allowNull: false },
      cantidad_maxima: { type: DataTypes.DECIMAL(6, 2), allowNull: false },
      vencimiento_vtv: { type: DataTypes.DATEONLY, allowNull: false },
      estado: {
        type: DataTypes.ENUM('Activo', 'En mantenimiento', 'Baja'),
        allowNull: false,
        defaultValue: 'Activo',
      },
      modificado_por: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      tableName: 'vehiculos',
      underscored: true,
      timestamps: true,
      createdAt: 'fecha_creacion',
      updatedAt: 'fecha_modificacion',
      paranoid: true,
      deletedAt: 'fecha_eliminacion',
    }
  );
  return Vehiculo;
};
