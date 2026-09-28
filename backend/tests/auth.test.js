const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { api, loginAdmin, cerrar } = require('./helpers');

after(cerrar);

test('health check responde ok', async () => {
  const res = await api().get('/api/health');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { ok: true });
});

test('login con credenciales correctas devuelve token y usuario', async () => {
  const res = await api().post('/api/auth/login').send({ email: 'admin@eflet.com', password: 'Admin123!' });
  assert.equal(res.status, 200);
  assert.ok(res.body.token);
  assert.equal(res.body.usuario.rol, 'Administrador');
  assert.equal(res.body.usuario.password_hash, undefined, 'nunca se devuelve el hash');
});

test('login con contraseña incorrecta -> 401 con mensaje generico', async () => {
  const res = await api().post('/api/auth/login').send({ email: 'admin@eflet.com', password: 'mala' });
  assert.equal(res.status, 401);
  assert.equal(res.body.mensaje, 'Email o contraseña incorrectos.');
});

test('login con email inexistente -> mismo mensaje (no revela si el email existe)', async () => {
  const res = await api().post('/api/auth/login').send({ email: 'nadie@eflet.com', password: 'x' });
  assert.equal(res.status, 401);
  assert.equal(res.body.mensaje, 'Email o contraseña incorrectos.');
});

test('login con email invalido -> 400', async () => {
  const res = await api().post('/api/auth/login').send({ email: 'no-es-un-email', password: 'x' });
  assert.equal(res.status, 400);
});

test('GET /auth/me devuelve el usuario del token', async () => {
  const token = await loginAdmin();
  const res = await api().get('/api/auth/me').set('Authorization', `Bearer ${token}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.usuario.rol, 'Administrador');
});

test('token invalido -> 401', async () => {
  const res = await api().get('/api/auth/me').set('Authorization', 'Bearer token.falso.123');
  assert.equal(res.status, 401);
});

test('ruta inexistente -> 404', async () => {
  const res = await api().get('/api/ruta-que-no-existe');
  assert.equal(res.status, 404);
});
