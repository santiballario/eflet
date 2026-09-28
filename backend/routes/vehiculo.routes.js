const { Router } = require('express');
const vehiculoController = require('../controllers/vehiculo.controller');
const {
  crearVehiculoValidator,
  actualizarVehiculoValidator,
  idValidator,
} = require('../domain/vehiculo.validators');
const validate = require('../middlewares/validate');
const { requireAuth, requireRole } = require('../middlewares/auth');

const router = Router();

// Todas las rutas de vehiculos requieren estar logueado.
router.use(requireAuth);

// Consultar: Administrador y Conductor (un conductor puede necesitar ver
// los datos del vehiculo que tiene asignado en su viaje).
router.get('/', vehiculoController.listar);
router.get('/:id', idValidator, validate, vehiculoController.obtener);

// Modificar: solo Administrador.
router.post(
  '/',
  requireRole('Administrador'),
  crearVehiculoValidator,
  validate,
  vehiculoController.crear
);
router.put(
  '/:id',
  requireRole('Administrador'),
  actualizarVehiculoValidator,
  validate,
  vehiculoController.actualizar
);
router.delete(
  '/:id',
  requireRole('Administrador'),
  idValidator,
  validate,
  vehiculoController.eliminar
);

module.exports = router;
