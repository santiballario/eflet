// Catalogo simple - sin auditoria (valores fijos)
'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MotivoNoEntrega = sequelize.define(
    'MotivoNoEntrega',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      descripcion: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    },
    {
      tableName: 'motivos_no_entrega',
      underscored: true,
      timestamps: false,
    }
  );
  return MotivoNoEntrega;
};
