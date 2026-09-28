const vehiculoService = require('../services/vehiculo.service');
const asyncHandler = require('../lib/async-handler');

// GET /api/vehiculos
const listar = asyncHandler(async (req, res) => {
  const vehiculos = await vehiculoService.listar();
  res.json({ vehiculos });
});

// GET /api/vehiculos/:id
const obtener = asyncHandler(async (req, res) => {
  const vehiculo = await vehiculoService.obtenerPorId(req.params.id);
  res.json({ vehiculo });
});

// POST /api/vehiculos
const crear = asyncHandler(async (req, res) => {
  const vehiculo = await vehiculoService.crear(req.body, req.usuario.id);
  res.status(201).json({ vehiculo });
});

// PUT /api/vehiculos/:id
const actualizar = asyncHandler(async (req, res) => {
  const vehiculo = await vehiculoService.actualizar(req.params.id, req.body, req.usuario.id);
  res.json({ vehiculo });
});

// DELETE /api/vehiculos/:id  (baja logica)
const eliminar = asyncHandler(async (req, res) => {
  await vehiculoService.eliminar(req.params.id);
  res.status(204).send();
});

module.exports = { listar, obtener, crear, actualizar, eliminar };
