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
      // Salida y regreso quedan en NULL mientras el viaje esta "En Deposito":
      // los carga el conductor al salir (km_salida) y al volver (km_regreso).
      fecha_salida: { type: DataTypes.DATE, allowNull: true },
      fecha_regreso: { type: DataTypes.DATE, allowNull: true },
      km_salida: { type: DataTypes.INTEGER, allowNull: true },
      km_regreso: { type: DataTypes.INTEGER, allowNull: true },
      modificado_por: { type: DataTypes.INTEGER, allowNull: true },

      // Atributo calculado (Clase 8): no se guarda en la base, se deriva de
      // km_salida y km_regreso para no tener dos datos que se desincronicen.
      km_recorridos: {
        type: DataTypes.VIRTUAL,
        get() {
          const salida = this.getDataValue('km_salida');
          const regreso = this.getDataValue('km_regreso');
          return salida !== null && regreso !== null ? regreso - salida : null;
        },
      },
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
