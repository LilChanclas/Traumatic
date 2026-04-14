import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { Provider, Rol } from 'generated/prisma/enums'

@Injectable()
export class UsuariosRepository {
  constructor(private prisma: PrismaService) {}

  findByCorreo(correo: string) {
    return this.prisma.usuario.findUnique({ where: { correo } })
  }

  findById(id: bigint) {
    return this.prisma.usuario.findUnique({ where: { id } })
  }

  findAll(filters?: { rol?: string; activo?: boolean; pendienteAprobacion?: boolean }) {
    return this.prisma.usuario.findMany({
      where: {
        ...(filters?.rol ? { rol: filters.rol as Rol } : {}),
        ...(filters?.activo !== undefined ? { activo: filters.activo } : {}),
        ...(filters?.pendienteAprobacion !== undefined
          ? { pendienteAprobacion: filters.pendienteAprobacion }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  create(data: {
    nombre: string
    apellidos: string
    correo: string
    provider: Provider
    providerId: string
    fotoUrl?: string
  }) {
    return this.prisma.usuario.create({
      data: { ...data, rol: Rol.ALUMNO },
    })
  }

  createWithRole(data: {
    nombre: string
    apellidos: string
    correo: string
    provider?: Provider | null
    providerId?: string | null
    fotoUrl?: string | null
    rol: Rol
    activo: boolean
    pendienteAprobacion: boolean
  }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.prisma.usuario.create({ data: data as any })
  }

  updateProviderData(id: bigint, providerId: string, fotoUrl?: string) {
    return this.prisma.usuario.update({
      where: { id },
      data: { providerId, fotoUrl },
    })
  }

  updateUser(
    id: bigint,
    data: {
      nombre?: string
      apellidos?: string
      rol?: Rol
      activo?: boolean
      pendienteAprobacion?: boolean
    },
  ) {
    return this.prisma.usuario.update({ where: { id }, data })
  }

  aprobar(id: bigint) {
    return this.prisma.usuario.update({
      where: { id },
      data: { activo: true, pendienteAprobacion: false },
    })
  }

  desactivar(id: bigint) {
    return this.prisma.usuario.update({
      where: { id },
      data: { activo: false },
    })
  }
}
