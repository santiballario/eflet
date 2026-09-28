const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/auth.controller');
const { loginValidator } = require('../domain/auth.validators');
const validate = require('../middlewares/validate');
const { requireAuth } = require('../middlewares/auth');

const router = Router();

// Limite mas estricto solo para login: frena intentos de fuerza bruta
// sobre contraseñas sin afectar al resto de la API.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: true, mensaje: 'Demasiados intentos. Intenta mas tarde.', codigo: 429 },
});

router.post('/login', loginLimiter, loginValidator, validate, authController.login);
router.get('/me', requireAuth, authController.me);

module.exports = router;
