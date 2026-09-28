// Traduce HTTP <-> service. Sin reglas de negocio: esas estan en
// services/viaje.service.js.
const viajeService = require('../services/viaje.service');
const asyncHandler = require('../lib/async-handler');

// GET /api/viajes?estado=&conductor_id=&vehiculo_id=
const listar = asyncHandler(async (req, res) => {
  const viajes = await viajeService.listar(req.query, req.usuario);
  res.json({ viajes });
});

// GET /api/viajes/:id
const obtener = asyncHandler(async (req, res) => {
  const viaje = await viajeService.obtenerPorId(req.params.id, req.usuario);
  res.json({ viaje });
});

// POST /api/viajes
const crear = asyncHandler(async (req, res) => {
  const viaje = await viajeService.crear(req.body, req.usuario.id);
  res.status(201).json({ viaje });
});

// PUT /api/viajes/:id
const actualizar = asyncHandler(async (req, res) => {
  const viaje = await viajeService.actualizar(req.params.id, req.body, req.usuario.id);
  res.json({ viaje });
});

// DELETE /api/viajes/:id (baja logica)
const eliminar = asyncHandler(async (req, res) => {
  await viajeService.eliminar(req.params.id, req.usuario.id);
  res.status(204).send();
});

// POST /api/viajes/:id/destinos
const agregarDestino = asyncHandler(async (req, res) => {
  const destino = await viajeService.agregarDestino(req.params.id, req.body, req.usuario.id);
  res.status(201).json({ destino });
});

// PUT /api/viajes/:id/destinos/:destinoId
const actualizarDestino = asyncHandler(async (req, res) => {
  const destino = await viajeService.actualizarDestino(req.params.id, req.params.destinoId, req.body, req.usuario.id);
  res.json({ destino });
});

// DELETE /api/viajes/:id/destinos/:destinoId
const eliminarDestino = asyncHandler(async (req, res) => {
  await viajeService.eliminarDestino(req.params.id, req.params.destinoId, req.usuario.id);
  res.status(204).send();
});

// POST /api/viajes/:id/salida  { km_salida }
const registrarSalida = asyncHandler(async (req, res) => {
  const viaje = await viajeService.registrarSalida(req.params.id, Number(req.body.km_salida), req.usuario);
  res.json({ viaje });
});

// PATCH /api/viajes/:id/destinos/:destinoId/entrega  { estado_entrega, motivo_id }
const registrarEntrega = asyncHandler(async (req, res) => {
  const viaje = await viajeService.registrarEntrega(req.params.id, req.params.destinoId, req.body, req.usuario);
  res.json({ viaje });
});

// POST /api/viajes/:id/regreso  { km_regreso }
const registrarRegreso = asyncHandler(async (req, res) => {
  const viaje = await viajeService.registrarRegreso(req.params.id, Number(req.body.km_regreso), req.usuario);
  res.json({ viaje });
});

module.exports = {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar,
  agregarDestino,
  actualizarDestino,
  eliminarDestino,
  registrarSalida,
  registrarEntrega,
  registrarRegreso,
};
