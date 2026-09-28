// Recorre el ciclo de vida completo de una hoja de ruta y cada regla de
// negocio que tiene que frenar una operacion invalida.
const { test, before, after, describe } = require('node:test');
const assert = require('node:assert/strict');
const { api, loginAdmin, login, crearVehiculo, crearConductor, cerrar } = require('./helpers');

let admin; // token del Administrador
let tc1; // token del conductor asignado
let tc2; // token de otro conductor
let v1; // vehiculo en regla
let v2; // vehiculo con VTV vencida
let c1;
let c2;

const conToken = (token) => ({ Authorization: `Bearer ${token}` });
const destinos = [
  { direccion_farmacia: 'Farmacia Central, Calle 7 N 1234', cantidad_bultos: 3 },
  { direccion_farmacia: 'Farmacia del Bosque, Av 1 N 500', cantidad_bultos: 5 },
];
const crearViaje = (body, token = admin) => api().post('/api/viajes').set(conToken(token)).send(body);

before(async () => {
  admin = await loginAdmin();
  v1 = await crearVehiculo(admin);
  v2 = await crearVehiculo(admin, { vencimiento_vtv: '2020-01-01' });
  const a = await crearConductor(admin);
  const b = await crearConductor(admin);
  c1 = a.conductor;
  c2 = b.conductor;
  tc1 = await login(a.email, a.password);
  tc2 = await login(b.email, b.password);
});
after(cerrar);

describe('creacion de la hoja de ruta (Administrador)', () => {
  test('vehiculo con VTV vencida -> 409', async () => {
    const res = await crearViaje({ vehiculo_id: v2.id, conductor_id: c1.id, destinos });
    assert.equal(res.status, 409);
    assert.match(res.body.mensaje, /VTV vencida/);
  });

  test('sin destinos -> 400', async () => {
    assert.equal((await crearViaje({ vehiculo_id: v1.id, conductor_id: c1.id, destinos: [] })).status, 400);
  });

  test('destino con 0 bultos -> 400', async () => {
    const res = await crearViaje({ vehiculo_id: v1.id, conductor_id: c1.id, destinos: [{ direccion_farmacia: 'x', cantidad_bultos: 0 }] });
    assert.equal(res.status, 400);
  });

  test('dos destinos con el mismo orden -> 400', async () => {
    const res = await crearViaje({
      vehiculo_id: v1.id,
      conductor_id: c1.id,
      destinos: [{ ...destinos[0], orden: 1 }, { ...destinos[1], orden: 1 }],
    });
    assert.equal(res.status, 400);
  });

  test('un conductor no puede crear viajes (403)', async () => {
    assert.equal((await crearViaje({ vehiculo_id: v1.id, conductor_id: c1.id, destinos }, tc1)).status, 403);
  });
});

describe('ciclo de vida completo de un viaje', () => {
  let viaje;
  let motivos;

  test('crear viaje -> 201, "En Depósito", destinos en orden y Pendientes', async () => {
    const res = await crearViaje({ vehiculo_id: v1.id, conductor_id: c1.id, destinos });
    assert.equal(res.status, 201);
    viaje = res.body.viaje;
    assert.equal(viaje.EstadoViaje.descripcion, 'En Depósito');
    assert.deepEqual(viaje.Destinos.map((d) => d.orden), [1, 2]);
    assert.ok(viaje.Destinos.every((d) => d.estado_entrega === 'Pendiente'));
    assert.equal(viaje.km_salida, null);
  });

  test('el mismo vehiculo no puede estar en dos viajes sin finalizar -> 409', async () => {
    assert.equal((await crearViaje({ vehiculo_id: v1.id, conductor_id: c2.id, destinos })).status, 409);
  });

  test('agregar, modificar y quitar un destino mientras esta en deposito', async () => {
    const alta = await api().post(`/api/viajes/${viaje.id}/destinos`).set(conToken(admin)).send({ direccion_farmacia: 'Farmacia Extra', cantidad_bultos: 1 });
    assert.equal(alta.status, 201);
    assert.equal(alta.body.destino.orden, 3, 'toma el siguiente orden libre');

    const mod = await api().put(`/api/viajes/${viaje.id}/destinos/${alta.body.destino.id}`).set(conToken(admin)).send({ cantidad_bultos: 2 });
    assert.equal(mod.status, 200);
    assert.equal(mod.body.destino.cantidad_bultos, 2);

    const baja = await api().delete(`/api/viajes/${viaje.id}/destinos/${alta.body.destino.id}`).set(conToken(admin));
    assert.equal(baja.status, 204);
  });

  test('no se da de baja un vehiculo ni un conductor con viaje activo -> 409', async () => {
    assert.equal((await api().delete(`/api/vehiculos/${v1.id}`).set(conToken(admin))).status, 409);
    assert.equal((await api().delete(`/api/conductores/${c1.id}`).set(conToken(admin))).status, 409);
  });

  test('otro conductor no ve ni opera el viaje (403) y su lista esta vacia', async () => {
    assert.equal((await api().get(`/api/viajes/${viaje.id}`).set(conToken(tc2))).status, 403);
    assert.equal((await api().post(`/api/viajes/${viaje.id}/salida`).set(conToken(tc2)).send({ km_salida: 1000 })).status, 403);
    const lista = await api().get('/api/viajes').set(conToken(tc2));
    assert.equal(lista.body.viajes.length, 0);
  });

  test('el conductor asignado ve su viaje', async () => {
    const lista = await api().get('/api/viajes').set(conToken(tc1));
    assert.ok(lista.body.viajes.some((v) => v.id === viaje.id));
  });

  test('el Administrador no registra la salida (es tarea del conductor) -> 403', async () => {
    assert.equal((await api().post(`/api/viajes/${viaje.id}/salida`).set(conToken(admin)).send({ km_salida: 1000 })).status, 403);
  });

  test('no se registra una entrega antes de salir -> 409', async () => {
    const res = await api().patch(`/api/viajes/${viaje.id}/destinos/${viaje.Destinos[0].id}/entrega`).set(conToken(tc1)).send({ estado_entrega: 'Entregado' });
    assert.equal(res.status, 409);
  });

  test('registrar salida -> "En Viaje" y el conductor queda "En viaje"', async () => {
    const res = await api().post(`/api/viajes/${viaje.id}/salida`).set(conToken(tc1)).send({ km_salida: 1000 });
    assert.equal(res.status, 200);
    assert.equal(res.body.viaje.EstadoViaje.descripcion, 'En Viaje');
    assert.equal(res.body.viaje.km_salida, 1000);
    assert.ok(res.body.viaje.fecha_salida);

    const cond = await api().get(`/api/conductores/${c1.id}`).set(conToken(admin));
    assert.equal(cond.body.conductor.disponibilidad, 'En viaje');
  });

  test('un viaje en curso no se edita ni se elimina -> 409', async () => {
    assert.equal((await api().put(`/api/viajes/${viaje.id}`).set(conToken(admin)).send({ vehiculo_id: v1.id })).status, 409);
    assert.equal((await api().delete(`/api/viajes/${viaje.id}`).set(conToken(admin))).status, 409);
  });

  test('"No entregado" exige motivo -> 400', async () => {
    const res = await api().patch(`/api/viajes/${viaje.id}/destinos/${viaje.Destinos[0].id}/entrega`).set(conToken(tc1)).send({ estado_entrega: 'No entregado' });
    assert.equal(res.status, 400);
  });

  test('"No entregado" con motivo: se guarda y el viaje sigue "En Viaje"', async () => {
    motivos = (await api().get('/api/motivos-no-entrega').set(conToken(tc1))).body.motivos;
    assert.ok(motivos.length >= 3);

    const res = await api()
      .patch(`/api/viajes/${viaje.id}/destinos/${viaje.Destinos[0].id}/entrega`)
      .set(conToken(tc1))
      .send({ estado_entrega: 'No entregado', motivo_id: motivos[0].id });
    assert.equal(res.status, 200);
    const destino = res.body.viaje.Destinos.find((d) => d.id === viaje.Destinos[0].id);
    assert.equal(destino.MotivoNoEntrega.descripcion, motivos[0].descripcion);
    assert.equal(res.body.viaje.EstadoViaje.descripcion, 'En Viaje');
  });

  test('un destino ya resuelto no se vuelve a marcar -> 409', async () => {
    const res = await api().patch(`/api/viajes/${viaje.id}/destinos/${viaje.Destinos[0].id}/entrega`).set(conToken(tc1)).send({ estado_entrega: 'Entregado' });
    assert.equal(res.status, 409);
  });

  test('no se registra el regreso con destinos pendientes -> 409', async () => {
    assert.equal((await api().post(`/api/viajes/${viaje.id}/regreso`).set(conToken(tc1)).send({ km_regreso: 1200 })).status, 409);
  });

  test('al resolver el ultimo destino el viaje pasa a "Entregado"', async () => {
    const res = await api().patch(`/api/viajes/${viaje.id}/destinos/${viaje.Destinos[1].id}/entrega`).set(conToken(tc1)).send({ estado_entrega: 'Entregado' });
    assert.equal(res.status, 200);
    assert.equal(res.body.viaje.EstadoViaje.descripcion, 'Entregado');
  });

  test('km de regreso menor al de salida -> 400', async () => {
    assert.equal((await api().post(`/api/viajes/${viaje.id}/regreso`).set(conToken(tc1)).send({ km_regreso: 900 })).status, 400);
  });

  test('registrar regreso -> "Finalizado", km recorridos calculados y conductor "Disponible"', async () => {
    const res = await api().post(`/api/viajes/${viaje.id}/regreso`).set(conToken(tc1)).send({ km_regreso: 1150 });
    assert.equal(res.status, 200);
    assert.equal(res.body.viaje.EstadoViaje.descripcion, 'Finalizado');
    assert.equal(res.body.viaje.km_recorridos, 150);

    const cond = await api().get(`/api/conductores/${c1.id}`).set(conToken(admin));
    assert.equal(cond.body.conductor.disponibilidad, 'Disponible');
  });

  test('un viaje finalizado no se elimina -> 409', async () => {
    assert.equal((await api().delete(`/api/viajes/${viaje.id}`).set(conToken(admin))).status, 409);
  });

  test('filtro ?estado=Finalizado', async () => {
    const res = await api().get('/api/viajes?estado=Finalizado').set(conToken(admin));
    assert.equal(res.status, 200);
    assert.ok(res.body.viajes.some((v) => v.id === viaje.id));
    assert.ok(res.body.viajes.every((v) => v.EstadoViaje.descripcion === 'Finalizado'));
  });

  test('filtro con estado inexistente -> 400', async () => {
    assert.equal((await api().get('/api/viajes?estado=Cualquiera').set(conToken(admin))).status, 400);
  });
});

describe('auditoria de kilometraje del vehiculo', () => {
  test('el km de salida no puede ser menor al ultimo regreso del vehiculo', async () => {
    // v1 volvio con 1150 km en el viaje anterior.
    const nuevo = await crearViaje({ vehiculo_id: v1.id, conductor_id: c1.id, destinos });
    assert.equal(nuevo.status, 201);

    const res = await api().post(`/api/viajes/${nuevo.body.viaje.id}/salida`).set(conToken(tc1)).send({ km_salida: 1100 });
    assert.equal(res.status, 400);

    assert.equal((await api().delete(`/api/viajes/${nuevo.body.viaje.id}`).set(conToken(admin))).status, 204);
  });
});

test('catalogo de estados de viaje', async () => {
  const res = await api().get('/api/estados-viaje').set(conToken(admin));
  assert.equal(res.status, 200);
  assert.deepEqual(res.body.estados.map((e) => e.descripcion), ['En Depósito', 'En Viaje', 'Entregado', 'Finalizado']);
});
