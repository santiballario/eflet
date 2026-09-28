const { Router } = require('express');
const conductorController = require('../controllers/conductor.controller');
const {
  crearConductorValidator,
  actualizarConductorValidator,
  idValidator,
} = require('../domain/conductor.validators');
const validate = require('../middlewares/validate');
const { requireAuth, requireRole } = require('../middlewares/auth');

const router = Router();

// Gestionar conductores (datos personales sensibles: DNI, telefono, licencia)
// es exclusivo del Administrador - un conductor no gestiona otros usuarios.
router.use(requireAuth, requireRole('Administrador'));

router.get('/', conductorController.listar);
router.get('/:id', idValidator, validate, conductorController.obtener);
router.post('/', crearConductorValidator, validate, conductorController.crear);
router.put('/:id', actualizarConductorValidator, validate, conductorController.actualizar);
router.delete('/:id', idValidator, validate, conductorController.eliminar);

module.exports = router;
