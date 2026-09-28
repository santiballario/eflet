// Tabla de credenciales pura - SIN datos personales (nombre, dni, telefono
// viven en Persona). Esta separacion es la correccion que pidio el docente
// en la devolucion de la Entrega 3.
'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Usuario = sequelize.define(
    'Usuario',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      // Nunca se guarda la contraseña en texto plano: password.service.js
      // se encarga de hashearla con bcrypt antes de llegar aca.
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      rol: {
        type: DataTypes.ENUM('Administrador', 'Conductor'),
        allowNull: false,
      },
      // Quien hizo la ultima modificacion (ver DER actualizado).
      modificado_por: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: 'usuarios',
      underscored: true,

      // --- Atributos de control y auditoria (ver DER, Clase 8) ---
      // timestamps agrega automaticamente created_at / updated_at
      timestamps: true,
      createdAt: 'fecha_creacion',
      updatedAt: 'fecha_modificacion',

      // paranoid convierte cualquier .destroy() en un UPDATE que llena
      // fecha_eliminacion, en vez de borrar la fila (baja logica). Ademas,
      // TODAS las consultas normales (findAll, findOne, etc.) filtran
      // automaticamente "WHERE fecha_eliminacion IS NULL" sin que haya
      // que escribirlo a mano en cada query.
      paranoid: true,
      deletedAt: 'fecha_eliminacion',
    }
  );

  return Usuario;
};
