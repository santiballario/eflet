const { test, after, before } = require('node:test');
const assert = require('node:assert/strict');
const { api, login, loginAdmin, crearConductor, cerrar } = require('./helpers');

after(cerrar);

// Cada test usa un conductor recien creado, asi cambiar su contraseña no
// afecta al admin ni a los demas tests.
let adminToken;
before(async () => {
  adminToken = await loginAdmin();
});

const cambiar = (token, body) =>
  api().put('/api/auth/password').set('Authorization', `Bearer ${token}`).send(body);

test('el usuario cambia su contraseña y puede entrar con la nueva', async () => {
  const { email, password } = await crearConductor(adminToken);
  const token = await login(email, password);

  const res = await cambiar(token, { password_actual: password, password_nueva: 'NuevaClave456!' });
  assert.equal(res.status, 200);
  assert.equal(res.body.mensaje, 'Contraseña actualizada.');

  // La nueva funciona y la vieja ya no
  await login(email, 'NuevaClave456!');
  const vieja = await api().post('/api/auth/login').send({ email, password });
  assert.equal(vieja.status, 401);
});

test('contraseña actual incorrecta -> 400 (no 401, la sesion sigue valida)', async () => {
  const { email, password } = await crearConductor(adminToken);
  const token = await login(email, password);

  const res = await cambiar(token, { password_actual: 'NoEsLaActual1', password_nueva: 'NuevaClave456!' });
  assert.equal(res.status, 400);
  assert.equal(res.body.mensaje, 'La contraseña actual es incorrecta.');
});

test('la nueva contraseña debe tener al menos 8 caracteres', async () => {
  const res = await cambiar(adminToken, { password_actual: 'Admin123!', password_nueva: 'corta' });
  assert.equal(res.status, 400);
  assert.equal(res.body.mensaje, 'La nueva contraseña debe tener al menos 8 caracteres.');
});

test('la nueva contraseña tiene que ser distinta de la actual', async () => {
  const res = await cambiar(adminToken, { password_actual: 'Admin123!', password_nueva: 'Admin123!' });
  assert.equal(res.status, 400);
  assert.equal(res.body.mensaje, 'La nueva contraseña tiene que ser distinta de la actual.');
});

test('sin token -> 401', async () => {
  const res = await api().put('/api/auth/password').send({ password_actual: 'x', password_nueva: 'NuevaClave456!' });
  assert.equal(res.status, 401);
});
