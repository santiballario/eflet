// Catalogos de solo lectura, para llenar los <select> del frontend
// (estados de viaje y motivos de no entrega). Sus valores son fijos: los
// carga scripts/setup.js y no se editan desde la API.
const { Router } = require('express');
const db = require('../models');
const asyncHandler = require('../lib/async-handler');
const { requireAuth } = require('../middlewares/auth');

const router = Router();

// requireAuth va en cada ruta (y no con router.use) porque este router se
// monta en "/": con router.use, cualquier URL inexistente daria 401 en vez
// de 404.

// GET /api/estados-viaje
router.get(
  '/estados-viaje',
  requireAuth,
  asyncHandler(async (req, res) => {
    const estados = await db.EstadoViaje.findAll({ order: [['id', 'ASC']] });
    res.json({ estados });
  })
);

// GET /api/motivos-no-entrega
router.get(
  '/motivos-no-entrega',
  requireAuth,
  asyncHandler(async (req, res) => {
    const motivos = await db.MotivoNoEntrega.findAll({ order: [['id', 'ASC']] });
    res.json({ motivos });
  })
);

module.exports = router;
