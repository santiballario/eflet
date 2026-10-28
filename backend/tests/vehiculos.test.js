const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { api, loginAdmin, crearVehiculo, crearConductor, login, sufijo, cerrar } = require('./helpers');

let admin;
const auth = () => ({ Authorization: `Bearer ${admin}` });

before(async () => {
  admin = await loginAdmin();
});
after(cerrar);

test('crear vehiculo -> 201 y el sistema completa modificado_por', async () => {
  const res = await api()
    .post('/api/vehiculos')
    .set(auth())
    .send({ patente: `A${sufijo()}`, marca: 'Fiat', modelo: 'Fiorino', cantidad_maxima: 600, vencimiento_vtv: '2030-01-01' });
  assert.equal(res.status, 201);
  assert.equal(res.body.vehiculo.estado, 'Activo', 'estado por defecto');
  assert.ok(res.body.vehiculo.modificado_por);
});

test('campos que no corresponden (id, modificado_por) se ignoran', async () => {
  const res = await api()
    .post('/api/vehiculos')
    .set(auth())
    .send({ patente: `B${sufijo()}`, marca: 'Fiat', modelo: 'Fiorino', cantidad_maxima: 600, vencimiento_vtv: '2030-01-01', id: 99999, modificado_por: 777 });
  assert.equal(res.status, 201);
  assert.notEqual(res.body.vehiculo.id, 99999);
  assert.notEqual(res.body.vehiculo.modificado_por, 777);
});

test('datos invalidos -> 400', async () => {
  const res = await api().post('/api/vehiculos').set(auth()).send({ patente: '', marca: 'Fiat', cantidad_maxima: -5 });
  assert.equal(res.status, 400);
});

test('capacidad mayor a la que admite la base -> 400 (antes daba error 500)', async () => {
  const res = await api().post('/api/vehiculos').set(auth()).send({
    patente: `C${sufijo()}`, marca: 'Renault', modelo: 'Master', cantidad_maxima: 99999999, vencimiento_vtv: '2030-01-01',
  });
  assert.equal(res.status, 400);
  assert.equal(res.body.mensaje, 'La capacidad maxima debe ser un numero mayor a 0 y de hasta 9999.99 kg.');
});

test('patente duplicada -> 409', async () => {
  const v = await crearVehiculo(admin);
  const res = await api()
    .post('/api/vehiculos')
    .set(auth())
    .send({ patente: v.patente, marca: 'X', modelo: 'Y', cantidad_maxima: 100, vencimiento_vtv: '2030-01-01' });
  assert.equal(res.status, 409);
});

test('listar y obtener por id', async () => {
  const v = await crearVehiculo(admin);
  const lista = await api().get('/api/vehiculos').set(auth());
  assert.equal(lista.status, 200);
  assert.ok(lista.body.vehiculos.some((x) => x.id === v.id));

  const uno = await api().get(`/api/vehiculos/${v.id}`).set(auth());
  assert.equal(uno.status, 200);
  assert.equal(uno.body.vehiculo.patente, v.patente);
});

test('actualizar vehiculo', async () => {
  const v = await crearVehiculo(admin);
  const res = await api().put(`/api/vehiculos/${v.id}`).set(auth()).send({ estado: 'En mantenimiento' });
  assert.equal(res.status, 200);
  assert.equal(res.body.vehiculo.estado, 'En mantenimiento');
});

test('eliminar es baja logica: despues da 404 y la patente no se puede reusar (409)', async () => {
  const v = await crearVehiculo(admin);
  assert.equal((await api().delete(`/api/vehiculos/${v.id}`).set(auth())).status, 204);
  assert.equal((await api().get(`/api/vehiculos/${v.id}`).set(auth())).status, 404);

  const reuso = await api()
    .post('/api/vehiculos')
    .set(auth())
    .send({ patente: v.patente, marca: 'X', modelo: 'Y', cantidad_maxima: 100, vencimiento_vtv: '2030-01-01' });
  assert.equal(reuso.status, 409);
});

test('un conductor puede consultar vehiculos pero no crearlos (403)', async () => {
  const { email, password } = await crearConductor(admin);
  const token = await login(email, password);
  assert.equal((await api().get('/api/vehiculos').set('Authorization', `Bearer ${token}`)).status, 200);
  const res = await api()
    .post('/api/vehiculos')
    .set('Authorization', `Bearer ${token}`)
    .send({ patente: `C${sufijo()}`, marca: 'X', modelo: 'Y', cantidad_maxima: 100, vencimiento_vtv: '2030-01-01' });
  assert.equal(res.status, 403);
});

test('sin token -> 401', async () => {
  assert.equal((await api().get('/api/vehiculos')).status, 401);
});
