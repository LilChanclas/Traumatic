import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { Provider, Rol } from 'generated/prisma/enums'

@Injectable()
export class UsuariosRepository {
  constructor(private prisma: PrismaService) {}

  findByCorreo(correo: string) {
    return this.prisma.usuario.findUnique({
      where: { correo },
    })
  }

  findById(id: bigint) {
    return this.prisma.usuario.findUnique({
      where: { id },
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
      data: {
        ...data,
        rol: Rol.ALUMNO,
      },
    })
  }

  updateProviderData(id: bigint, providerId: string, fotoUrl?: string) {
    return this.prisma.usuario.update({
      where: { id },
      data: {
        providerId,
        fotoUrl,
      },
    })
  }
}