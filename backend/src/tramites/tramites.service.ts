import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class TramitesService {
  constructor(private readonly prisma: PrismaService) {}

  private async generarFolio(): Promise<string> {
    const year = new Date().getFullYear()
    const count = await this.prisma.tramite.count({
      where: { folio: { startsWith: `TRM-${year}-` } },
    })
    const num = String(count + 1).padStart(4, '0')
    return `TRM-${year}-${num}`
  }

  async create(idUsuario: bigint, idTipoTramite: bigint, comentariosAlumno?: string) {
    const tipo = await this.prisma.tipoTramite.findUnique({
      where: { idTipo: idTipoTramite, activo: true },
    })
    if (!tipo) throw new NotFoundException('Tipo de trámite no encontrado o inactivo')

    const folio = await this.generarFolio()

    const tramite = await this.prisma.tramite.create({
      data: {
        folio,
        idUsuarioSolicitante: idUsuario,
        idTipoTramite,
        comentariosAlumno: comentariosAlumno ?? null,
        estado: 'ENVIADO',
      },
    })

    await this.prisma.historialTramite.create({
      data: {
        idTramite: tramite.idTramite,
        idUsuarioAccion: idUsuario,
        estadoAnterior: null,
        estadoNuevo: 'ENVIADO',
        comentario: 'Trámite enviado por el alumno',
      },
    })

    return tramite
  }

  async findMisTramites(idUsuario: bigint) {
    return this.prisma.tramite.findMany({
      where: { idUsuarioSolicitante: idUsuario },
      include: { tipoTramite: true, documentos: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findById(idTramite: bigint, idUsuario: bigint) {
    const tramite = await this.prisma.tramite.findUnique({
      where: { idTramite },
      include: {
        tipoTramite: true,
        documentos: true,
        historial: {
          include: { usuario: { select: { nombre: true, apellidos: true, rol: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    })
    if (!tramite) throw new NotFoundException('Trámite no encontrado')
    if (tramite.idUsuarioSolicitante !== idUsuario)
      throw new ForbiddenException('No tienes acceso a este trámite')
    return tramite
  }
}
