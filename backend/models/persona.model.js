// Datos personales, separados de Usuario (que solo tiene credenciales).
'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Persona = sequelize.define(
    'Persona',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true, // relacion 1 a 1 con Usuario
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      apellido: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      dni: {
        type: DataTypes.STRING(15),
        allowNull: false,
        unique: true,
      },
      telefono: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      // Quien hizo la ultima modificacion (FK logica a usuarios.id).
      // No se declara como FK de Sequelize porque no es una relacion de
      // negocio central del DER - es un dato tecnico de auditoria, tal
      // como lo charlamos: se materializa aca, en el modelo fisico.
      modificado_por: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: 'personas',
      underscored: true,
      timestamps: true,
      createdAt: 'fecha_creacion',
      updatedAt: 'fecha_modificacion',
      paranoid: true,
      deletedAt: 'fecha_eliminacion',
    }
  );

  return Persona;
};
