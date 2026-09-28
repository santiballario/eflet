const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { api, loginAdmin, crearConductor, login, cerrar } = require('./helpers');

let admin;
const auth = () => ({ Authorization: `Bearer ${admin}` });

before(async () => {
  admin = await loginAdmin();
});
after(cerrar);

test('crear conductor crea Usuario + Persona + Conductor y los devuelve anidados', async () => {
  const { conductor } = await crearConductor(admin, { nombre: 'Maria' });
  assert.equal(conductor.disponibilidad, 'Disponible');
  assert.equal(conductor.Usuario.rol, 'Conductor');
  assert.equal(conductor.Usuario.Persona.nombre, 'Maria');
});

test('el conductor creado puede loguearse con rol Conductor', async () => {
  const { email, password } = await crearConductor(admin);
  const res = await api().post('/api/auth/login').send({ email, password });
  assert.equal(res.status, 200);
  assert.equal(res.body.usuario.rol, 'Conductor');
});

test('email duplicado -> 409', async () => {
  const { email } = await crearConductor(admin);
  const res = await api().post('/api/conductores').set(auth()).send({
    email, password: 'Conductor123!', nombre: 'X', apellido: 'Y', dni: '99999999',
    telefono: '1', nro_licencia: 'OTRA-LIC', vencimiento_licencia: '2030-01-01',
  });
  assert.equal(res.status, 409);
});

test('contraseña corta -> 400', async () => {
  const res = await api().post('/api/conductores').set(auth()).send({
    email: 'corta@eflet.com', password: '123', nombre: 'X', apellido: 'Y', dni: '1',
    telefono: '1', nro_licencia: 'L', vencimiento_licencia: '2030-01-01',
  });
  assert.equal(res.status, 400);
});

test('listar y obtener por id incluyen los datos personales', async () => {
  const { conductor } = await crearConductor(admin);
  const lista = await api().get('/api/conductores').set(auth());
  assert.equal(lista.status, 200);
  assert.ok(lista.body.conductores.some((c) => c.id === conductor.id));

  const uno = await api().get(`/api/conductores/${conductor.id}`).set(auth());
  assert.equal(uno.status, 200);
  assert.ok(uno.body.conductor.Usuario.Persona.dni);
});

test('actualizar modifica Persona y Conductor e ignora campos no permitidos', async () => {
  const { conductor } = await crearConductor(admin);
  const res = await api()
    .put(`/api/conductores/${conductor.id}`)
    .set(auth())
    .send({ telefono: '221-1112222', disponibilidad: 'No disponible', usuario_id: 1 });
  assert.equal(res.status, 200);
  assert.equal(res.body.conductor.Usuario.Persona.telefono, '221-1112222');
  assert.equal(res.body.conductor.disponibilidad, 'No disponible');
  assert.equal(res.body.conductor.usuario_id, conductor.usuario_id);
});

test('eliminar da de baja al conductor y ya no puede loguearse', async () => {
  const { conductor, email, password } = await crearConductor(admin);
  assert.equal((await api().delete(`/api/conductores/${conductor.id}`).set(auth())).status, 204);
  assert.equal((await api().get(`/api/conductores/${conductor.id}`).set(auth())).status, 404);
  assert.equal((await api().post('/api/auth/login').send({ email, password })).status, 401);
});

test('un conductor no puede gestionar conductores (403)', async () => {
  const { email, password } = await crearConductor(admin);
  const token = await login(email, password);
  assert.equal((await api().get('/api/conductores').set('Authorization', `Bearer ${token}`)).status, 403);
});
