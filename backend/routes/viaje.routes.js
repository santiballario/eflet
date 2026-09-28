const { Router } = require('express');
const viajeController = require('../controllers/viaje.controller');
const v = require('../domain/viaje.validators');
const validate = require('../middlewares/validate');
const { requireAuth, requireRole } = require('../middlewares/auth');

const router = Router();
const soloAdmin = requireRole('Administrador');
const soloConductor = requireRole('Conductor');

// Todas las rutas de viajes requieren estar logueado.
router.use(requireAuth);

// Consultar: los dos roles. El service filtra para que un Conductor vea
// solo sus propios viajes.
router.get('/', v.listarViajesValidator, validate, viajeController.listar);
router.get('/:id', v.idValidator, validate, viajeController.obtener);

// Armar la hoja de ruta: solo Administrador.
router.post('/', soloAdmin, v.crearViajeValidator, validate, viajeController.crear);
router.put('/:id', soloAdmin, v.actualizarViajeValidator, validate, viajeController.actualizar);
router.delete('/:id', soloAdmin, v.idValidator, validate, viajeController.eliminar);

router.post('/:id/destinos', soloAdmin, v.agregarDestinoValidator, validate, viajeController.agregarDestino);
router.put('/:id/destinos/:destinoId', soloAdmin, v.actualizarDestinoValidator, validate, viajeController.actualizarDestino);
router.delete('/:id/destinos/:destinoId', soloAdmin, v.destinoIdValidator, validate, viajeController.eliminarDestino);

// Registrar el recorrido: solo el Conductor asignado (el service verifica
// que el viaje sea suyo).
router.post('/:id/salida', soloConductor, v.salidaValidator, validate, viajeController.registrarSalida);
router.patch('/:id/destinos/:destinoId/entrega', soloConductor, v.entregaValidator, validate, viajeController.registrarEntrega);
router.post('/:id/regreso', soloConductor, v.regresoValidator, validate, viajeController.registrarRegreso);

module.exports = router;
