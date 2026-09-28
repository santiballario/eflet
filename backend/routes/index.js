// Punto central de rutas: a medida que se agreguen mas modulos (vehiculos,
// conductores, viajes) se importan y montan aca, y app.js no cambia mas.
const { Router } = require('express');

const authRoutes = require('./auth.routes');
const vehiculoRoutes = require('./vehiculo.routes');
const conductorRoutes = require('./conductor.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/vehiculos', vehiculoRoutes);
router.use('/conductores', conductorRoutes);

module.exports = router;
