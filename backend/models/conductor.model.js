'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Conductor = sequelize.define(
    'Conductor',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      usuario_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
      nro_licencia: { type: DataTypes.STRING(30), allowNull: false, unique: true },
      vencimiento_licencia: { type: DataTypes.DATEONLY, allowNull: false },
      disponibilidad: {
        type: DataTypes.ENUM('Disponible', 'En viaje', 'No disponible'),
        allowNull: false,
        defaultValue: 'Disponible',
      },
      modificado_por: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      tableName: 'conductores',
      underscored: true,
      timestamps: true,
      createdAt: 'fecha_creacion',
      updatedAt: 'fecha_modificacion',
      paranoid: true,
      deletedAt: 'fecha_eliminacion',
    }
  );
  return Conductor;
};
