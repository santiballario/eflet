const conductorService = require('../services/conductor.service');
const asyncHandler = require('../lib/async-handler');

const listar = asyncHandler(async (req, res) => {
  const conductores = await conductorService.listar();
  res.json({ conductores });
});

const obtener = asyncHandler(async (req, res) => {
  const conductor = await conductorService.obtenerPorId(req.params.id);
  res.json({ conductor });
});

const crear = asyncHandler(async (req, res) => {
  const conductor = await conductorService.crear(req.body);
  res.status(201).json({ conductor });
});

const actualizar = asyncHandler(async (req, res) => {
  const conductor = await conductorService.actualizar(req.params.id, req.body, req.usuario.id);
  res.json({ conductor });
});

const eliminar = asyncHandler(async (req, res) => {
  await conductorService.eliminar(req.params.id);
  res.status(204).send();
});

module.exports = { listar, obtener, crear, actualizar, eliminar };
