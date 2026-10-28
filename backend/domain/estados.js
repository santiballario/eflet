// Valores fijos del dominio, en un solo lugar. Tienen que coincidir con los
// catalogos que carga scripts/setup.js y con los ENUM de los modelos.

// Ciclo de vida de una hoja de ruta (tabla estados_viaje):
// En Deposito -> En Viaje -> Entregado -> Finalizado
const ESTADO_VIAJE = {
  EN_DEPOSITO: 'En Depósito',
  EN_VIAJE: 'En Viaje',
  ENTREGADO: 'Entregado',
  FINALIZADO: 'Finalizado',
};

const ESTADO_ENTREGA = {
  PENDIENTE: 'Pendiente',
  ENTREGADO: 'Entregado',
  NO_ENTREGADO: 'No entregado',
};

// Motivo de no entrega que exige una descripcion escrita por el conductor
const MOTIVO_OTRO = 'Otro';

const DISPONIBILIDAD = {
  DISPONIBLE: 'Disponible',
  EN_VIAJE: 'En viaje',
  NO_DISPONIBLE: 'No disponible',
};

const ESTADO_VEHICULO = {
  ACTIVO: 'Activo',
  EN_MANTENIMIENTO: 'En mantenimiento',
  BAJA: 'Baja',
};

// Topes para que un numero absurdo (por error de tipeo) no llegue a la base:
// las columnas INT de MySQL no admiten valores enormes y respondian con un 500.
const LIMITES = {
  BULTOS_POR_PARADA: 1000,
  PARADAS_POR_VIAJE: 50,
  KM: 2000000,
};

module.exports = { ESTADO_VIAJE, ESTADO_ENTREGA, MOTIVO_OTRO, DISPONIBILIDAD, ESTADO_VEHICULO, LIMITES };
