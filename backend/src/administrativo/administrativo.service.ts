import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { EstadoTramite } from 'generated/prisma/enums'

const TRANSICIONES_VALIDAS: Partial<Record<EstadoTramite, EstadoTramite[]>> = {
  ENVIADO: ['EN_REVISION', 'RECHAZADO'],
  EN_REVISION: ['APROBADO', 'RECHAZADO'],
  APROBADO: ['ENTREGADO'],
}

@Injectable()
export class AdministrativoService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(estado?: string) {
    return this.prisma.tramite.findMany({
      where: estado ? { estado: estado as EstadoTramite } : undefined,
      include: {
        tipoTramite: true,
        usuario: { select: { id: true, nombre: true, apellidos: true, correo: true, fotoUrl: true } },
        documentos: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findById(idTramite: bigint) {
    const tramite = await this.prisma.tramite.findUnique({
      where: { idTramite },
      include: {
        tipoTramite: true,
        usuario: { select: { id: true, nombre: true, apellidos: true, correo: true, fotoUrl: true } },
        documentos: true,
        historial: {
          include: { usuario: { select: { nombre: true, apellidos: true, rol: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    })
    if (!tramite) throw new NotFoundException('Trámite no encontrado')
    return tramite
  }

  async cambiarEstado(
    idTramite: bigint,
    idAdministrativo: bigint,
    nuevoEstado: EstadoTramite,
    comentario?: string,
  ) {
    const tramite = await this.prisma.tramite.findUnique({ where: { idTramite } })
    if (!tramite) throw new NotFoundException('Trámite no encontrado')

    const permitidos = TRANSICIONES_VALIDAS[tramite.estado] ?? []
    if (!permitidos.includes(nuevoEstado)) {
      throw new BadRequestException(
        `No se puede pasar de ${tramite.estado} a ${nuevoEstado}`,
      )
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.tramite.update({
        where: { idTramite },
        data: {
          estado: nuevoEstado,
          ...(nuevoEstado === 'RECHAZADO' && { motivoRechazo: comentario ?? null }),
        },
        include: {
          tipoTramite: true,
          usuario: { select: { id: true, nombre: true, apellidos: true, correo: true, fotoUrl: true } },
          documentos: true,
          historial: {
            include: { usuario: { select: { nombre: true, apellidos: true, rol: true } } },
            orderBy: { createdAt: 'asc' },
          },
        },
      }),
      this.prisma.historialTramite.create({
        data: {
          idTramite,
          idUsuarioAccion: idAdministrativo,
          estadoAnterior: tramite.estado,
          estadoNuevo: nuevoEstado,
          comentario: comentario ?? null,
        },
      }),
    ])

    return updated
  }
}
