// Punto central que arma la conexion a la base y carga todos los modelos.
// Las relaciones de aca abajo son la traduccion 1:1 del DER a codigo.
'use strict';

const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const config = require('../config/database')['development'];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

const db = {};

fs.readdirSync(__dirname)
  .filter((file) => file.endsWith('.model.js'))
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize);
    db[model.name] = model;
  });

// --- Relaciones (ver DER "Relaciones actualizadas") ---

// USUARIO (1) -- (1) PERSONA
db.Usuario.hasOne(db.Persona, { foreignKey: 'usuario_id' });
db.Persona.belongsTo(db.Usuario, { foreignKey: 'usuario_id' });

// USUARIO (1) -- (1) CONDUCTOR
db.Usuario.hasOne(db.Conductor, { foreignKey: 'usuario_id' });
db.Conductor.belongsTo(db.Usuario, { foreignKey: 'usuario_id' });

// USUARIO (1) -- (N) VIAJE  (quien creo la hoja de ruta)
db.Usuario.hasMany(db.Viaje, { foreignKey: 'usuario_creador_id' });
db.Viaje.belongsTo(db.Usuario, { foreignKey: 'usuario_creador_id', as: 'creador' });

// VEHICULO (1) -- (N) VIAJE
db.Vehiculo.hasMany(db.Viaje, { foreignKey: 'vehiculo_id' });
db.Viaje.belongsTo(db.Vehiculo, { foreignKey: 'vehiculo_id' });

// CONDUCTOR (1) -- (N) VIAJE
db.Conductor.hasMany(db.Viaje, { foreignKey: 'conductor_id' });
db.Viaje.belongsTo(db.Conductor, { foreignKey: 'conductor_id' });

// ESTADO_VIAJE (1) -- (N) VIAJE
db.EstadoViaje.hasMany(db.Viaje, { foreignKey: 'estado_id' });
db.Viaje.belongsTo(db.EstadoViaje, { foreignKey: 'estado_id' });

// VIAJE (1) -- (N) DESTINO
db.Viaje.hasMany(db.Destino, { foreignKey: 'viaje_id' });
db.Destino.belongsTo(db.Viaje, { foreignKey: 'viaje_id' });

// MOTIVO_NO_ENTREGA (1) -- (N) DESTINO
db.MotivoNoEntrega.hasMany(db.Destino, { foreignKey: 'motivo_id' });
db.Destino.belongsTo(db.MotivoNoEntrega, { foreignKey: 'motivo_id' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
