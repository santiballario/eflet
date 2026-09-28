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

module.exports = { ESTADO_VIAJE, ESTADO_ENTREGA, DISPONIBILIDAD, ESTADO_VEHICULO };
