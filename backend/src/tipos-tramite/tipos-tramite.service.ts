import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class TiposTramiteService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.tipoTramite.findMany({ orderBy: { createdAt: 'asc' } })
  }

  async create(data: { nombre: string; descripcion?: string; docsRequeridos?: string[] }) {
    const exists = await this.prisma.tipoTramite.findUnique({ where: { nombre: data.nombre } })
    if (exists) throw new ConflictException('Ya existe un tipo de trámite con ese nombre')

    return this.prisma.tipoTramite.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion ?? null,
        docsRequeridos: data.docsRequeridos ?? [],
        activo: true,
      },
    })
  }

  async update(id: bigint, data: { nombre?: string; descripcion?: string; docsRequeridos?: string[] }) {
    const tipo = await this.prisma.tipoTramite.findUnique({ where: { idTipo: id } })
    if (!tipo) throw new NotFoundException('Tipo de trámite no encontrado')

    if (data.nombre && data.nombre !== tipo.nombre) {
      const exists = await this.prisma.tipoTramite.findUnique({ where: { nombre: data.nombre } })
      if (exists) throw new ConflictException('Ya existe un tipo de trámite con ese nombre')
    }

    return this.prisma.tipoTramite.update({
      where: { idTipo: id },
      data: {
        ...(data.nombre !== undefined && { nombre: data.nombre }),
        ...(data.descripcion !== undefined && { descripcion: data.descripcion }),
        ...(data.docsRequeridos !== undefined && { docsRequeridos: data.docsRequeridos }),
      },
    })
  }

  async activar(id: bigint) {
    const tipo = await this.prisma.tipoTramite.findUnique({ where: { idTipo: id } })
    if (!tipo) throw new NotFoundException('Tipo de trámite no encontrado')
    return this.prisma.tipoTramite.update({ where: { idTipo: id }, data: { activo: true } })
  }

  async desactivar(id: bigint) {
    const tipo = await this.prisma.tipoTramite.findUnique({ where: { idTipo: id } })
    if (!tipo) throw new NotFoundException('Tipo de trámite no encontrado')
    return this.prisma.tipoTramite.update({ where: { idTipo: id }, data: { activo: false } })
  }
}
