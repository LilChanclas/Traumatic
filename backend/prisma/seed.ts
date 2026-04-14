/**
 * Seed — crea el primer usuario ADMIN si no existe.
 * Uso: npm run seed
 */
import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const ADMIN_CORREO = 'jtrasvinachavez@gmail.com'

  const existing = await prisma.usuario.findUnique({
    where: { correo: ADMIN_CORREO },
  })

  if (existing) {
    console.log(`✓ Admin ya existe (${existing.correo}) — sin cambios.`)
    return
  }

  const admin = await prisma.usuario.create({
    data: {
      nombre: 'Super',
      apellidos: 'Admin',
      correo: ADMIN_CORREO,
      rol: 'ADMIN',
      provider: 'MANUAL',
      providerId: ADMIN_CORREO,
      activo: true,
      pendienteAprobacion: false,
    },
  })

  console.log(`✅ Admin creado:`)
  console.log(`   Nombre : ${admin.nombre} ${admin.apellidos}`)
  console.log(`   Correo : ${admin.correo}`)
  console.log(`   Rol    : ${admin.rol}`)
  console.log()
  console.log('→ Para iniciar sesión, usa Google o Microsoft con la cuenta:')
  console.log(`  ${ADMIN_CORREO}`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
