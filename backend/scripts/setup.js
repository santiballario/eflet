// Crea las tablas en MySQL a partir de los modelos y carga datos de prueba.
// Uso:
//   npm run setup      -> crea tablas si no existen (no borra nada)
//   npm run db:reset   -> BORRA todas las tablas y las vuelve a crear + reseed
require('dotenv').config();

const db = require('../models');
const { hashPassword } = require('../lib/password');

const FORCE = process.argv.includes('--force');

async function seedCatalogos() {
  const estados = ['En Depósito', 'En Viaje', 'Entregado', 'Finalizado'];
  for (const descripcion of estados) {
    await db.EstadoViaje.findOrCreate({ where: { descripcion } });
  }

  const motivos = [
    'Local cerrado',
    'Dirección incorrecta',
    'Rechazado por el cliente',
  ];
  for (const descripcion of motivos) {
    await db.MotivoNoEntrega.findOrCreate({ where: { descripcion } });
  }

  console.log('Catálogos (Estado_Viaje, Motivo_No_Entrega) cargados.');
}

async function seedUsuarioAdmin() {
  const existe = await db.Usuario.findOne({ where: { email: 'admin@eflet.com' } });
  if (existe) {
    console.log('El usuario admin de prueba ya existe, no se crea de nuevo.');
    return;
  }

  const passwordHash = await hashPassword('Admin123!');
  const admin = await db.Usuario.create({
    email: 'admin@eflet.com',
    password_hash: passwordHash,
    rol: 'Administrador',
  });

  await db.Persona.create({
    usuario_id: admin.id,
    nombre: 'Admin',
    apellido: 'eFlet',
    dni: '00000000',
    telefono: '000-0000000',
  });

  console.log('Usuario admin de prueba creado -> email: admin@eflet.com / password: Admin123!');
}

async function main() {
  if (FORCE) {
    console.log('Recreando todas las tablas desde cero (--force)...');
  } else {
    console.log('Sincronizando tablas (se crean solo las que falten)...');
  }

  await db.sequelize.sync({ force: FORCE, alter: !FORCE });
  console.log('Tablas listas.');

  await seedCatalogos();
  await seedUsuarioAdmin();

  console.log('Setup completo.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Error durante el setup:', err);
  process.exit(1);
});
