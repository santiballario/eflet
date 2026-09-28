// Catalogo simple - sin auditoria (valores fijos, se cargan una sola vez con el seeder)
'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const EstadoViaje = sequelize.define(
    'EstadoViaje',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      descripcion: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    },
    {
      tableName: 'estados_viaje',
      underscored: true,
      timestamps: false,
    }
  );
  return EstadoViaje;
};
