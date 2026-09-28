// Utilidades compartidas por todos los tests.
//
// Los tests corren contra una base APARTE (DB_NAME_TEST, por defecto
// "<DB_NAME>_test"), nunca contra la de desarrollo. "npm test" la crea y le
// corre las migraciones y seeders antes de empezar (ver "pretest" en
// package.json).
process.env.NODE_ENV = 'test';
require('dotenv').config();
process.env.JWT_SECRET = process.env.JWT_SECRET || 'secreto-solo-para-tests';

const request = require('supertest');
const app = require('../app');
const db = require('../models');

// Sufijo unico por corrida, para que los datos de un test (patentes, emails,
// DNI) no choquen con los de otra corrida.
const sufijo = () => `${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;

// Cliente HTTP contra la app, sin levantar un puerto real (por eso app.js
// esta separado de server.js).
const api = () => request(app);

async function login(email, password) {
  const res = await api().post('/api/auth/login').send({ email, password });
  if (res.status !== 200) throw new Error(`No se pudo loguear ${email}: ${res.status} ${JSON.stringify(res.body)}`);
  return res.body.token;
}

const loginAdmin = () => login('admin@eflet.com', 'Admin123!');

// Crea un vehiculo valido (o con los cambios que se pasen) y lo devuelve.
async function crearVehiculo(token, cambios = {}) {
  const res = await api()
    .post('/api/vehiculos')
    .set('Authorization', `Bearer ${token}`)
    .send({
      patente: `T${sufijo()}`,
      marca: 'Renault',
      modelo: 'Kangoo',
      cantidad_maxima: 650,
      vencimiento_vtv: '2030-01-01',
      ...cambios,
    });
  if (res.status !== 201) throw new Error(`No se pudo crear el vehiculo: ${JSON.stringify(res.body)}`);
  return res.body.vehiculo;
}

// Crea un conductor valido y devuelve { conductor, email, password }.
async function crearConductor(token, cambios = {}) {
  const s = sufijo();
  const datos = {
    email: `conductor${s}@eflet.com`,
    password: 'Conductor123!',
    nombre: 'Juan',
    apellido: 'Perez',
    dni: `3${s}`.slice(0, 15),
    telefono: '221-5550000',
    nro_licencia: `LIC-${s}`,
    vencimiento_licencia: '2030-01-01',
    ...cambios,
  };
  const res = await api().post('/api/conductores').set('Authorization', `Bearer ${token}`).send(datos);
  if (res.status !== 201) throw new Error(`No se pudo crear el conductor: ${JSON.stringify(res.body)}`);
  return { conductor: res.body.conductor, email: datos.email, password: datos.password };
}

// Cierra la conexion a MySQL al terminar, si no el proceso queda colgado.
const cerrar = () => db.sequelize.close();

module.exports = { api, login, loginAdmin, crearVehiculo, crearConductor, sufijo, cerrar };
