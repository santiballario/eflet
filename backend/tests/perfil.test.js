const { test, after, before } = require('node:test');
const assert = require('node:assert/strict');
const { api, login, loginAdmin, crearConductor, cerrar } = require('./helpers');

after(cerrar);

let adminToken;
before(async () => {
  adminToken = await loginAdmin();
});

const me = (token) => api().get('/api/auth/me').set('Authorization', `Bearer ${token}`);
const actualizar = (token, body) => api().patch('/api/auth/me').set('Authorization', `Bearer ${token}`).send(body);

test('el login devuelve el nombre para el saludo', async () => {
  const res = await api().post('/api/auth/login').send({ email: 'admin@eflet.com', password: 'Admin123!' });
  assert.equal(res.status, 200);
  assert.equal(res.body.usuario.nombre, 'Admin');
  assert.equal(res.body.usuario.apellido, 'eFlet');
});

test('GET /auth/me del admin: datos personales y sin licencia', async () => {
  const res = await me(adminToken);
  assert.equal(res.status, 200);
  const u = res.body.usuario;
  assert.equal(u.email, 'admin@eflet.com');
  assert.equal(u.rol, 'Administrador');
  assert.equal(u.nombre, 'Admin');
  assert.equal(u.conductor, null);
  assert.equal(u.password_hash, undefined, 'nunca se devuelve el hash');
});

test('GET /auth/me del conductor incluye su licencia', async () => {
  const { email, password } = await crearConductor(adminToken, { nombre: 'Ana', vencimiento_licencia: '2031-05-20' });
  const token = await login(email, password);

  const res = await me(token);
  assert.equal(res.status, 200);
  assert.equal(res.body.usuario.nombre, 'Ana');
  assert.equal(res.body.usuario.conductor.vencimiento_licencia, '2031-05-20');
  assert.equal(res.body.usuario.conductor.disponibilidad, 'Disponible');
});

test('el usuario actualiza su telefono', async () => {
  const { email, password } = await crearConductor(adminToken);
  const token = await login(email, password);

  const res = await actualizar(token, { telefono: '221 456-7890' });
  assert.equal(res.status, 200);
  assert.equal(res.body.usuario.telefono, '221 456-7890');
  assert.equal((await me(token)).body.usuario.telefono, '221 456-7890');
});

test('solo se puede cambiar el telefono: el resto de los campos se ignora', async () => {
  const { email, password } = await crearConductor(adminToken, { nombre: 'Pedro' });
  const token = await login(email, password);

  const res = await actualizar(token, { telefono: '221-1112222', nombre: 'Hackeado', email: 'otro@eflet.com', vencimiento_licencia: '2099-01-01' });
  assert.equal(res.status, 200);
  assert.equal(res.body.usuario.nombre, 'Pedro');
  assert.equal(res.body.usuario.email, email);
  assert.notEqual(res.body.usuario.conductor.vencimiento_licencia, '2099-01-01');
});

test('telefono invalido -> 400', async () => {
  const vacio = await actualizar(adminToken, { telefono: '' });
  assert.equal(vacio.status, 400);
  const letras = await actualizar(adminToken, { telefono: 'llamame' });
  assert.equal(letras.status, 400);
  assert.equal(letras.body.mensaje, 'El teléfono solo puede tener números, espacios, guiones, paréntesis y +.');
});

test('si la cuenta se dio de baja, /auth/me responde 401', async () => {
  const { conductor, email, password } = await crearConductor(adminToken);
  const token = await login(email, password);

  await api().delete(`/api/conductores/${conductor.id}`).set('Authorization', `Bearer ${adminToken}`);
  const res = await me(token);
  assert.equal(res.status, 401);
});
