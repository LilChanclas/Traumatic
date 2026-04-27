import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { EmailService } from '../email/email.service'
import { EstadoTramite } from 'generated/prisma/enums'

const TRANSICIONES_VALIDAS: Partial<Record<EstadoTramite, EstadoTramite[]>> = {
  ENVIADO: ['EN_REVISION', 'RECHAZADO'],
  EN_REVISION: ['APROBADO', 'RECHAZADO'],
  APROBADO: ['ENTREGADO'],
}

@Injectable()
export class AdministrativoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
  ) {}

  async findAll(estado?: string, page = 1, pageSize = 20) {
    const where = estado ? { estado: estado as EstadoTramite } : undefined
    const skip  = (page - 1) * pageSize

    const [data, total] = await this.prisma.$transaction([
      this.prisma.tramite.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          tipoTramite: true,
          usuario: { select: { id: true, nombre: true, apellidos: true, correo: true, fotoUrl: true } },
          documentos: true,
          historial: {
            include: { usuario: { select: { nombre: true, apellidos: true, rol: true } } },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tramite.count({ where }),
    ])

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
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

    // Correo de cambio de estado al alumno (sin bloquear la respuesta)
    const usuario = (updated as any).usuario
    if (usuario?.correo) {
      this.email.enviarCambioEstado({
        correo:      usuario.correo,
        nombre:      `${usuario.nombre} ${usuario.apellidos}`,
        folio:       updated.folio,
        tipoNombre:  (updated as any).tipoTramite?.nombre ?? 'Trámite',
        nuevoEstado,
        comentario,
      }).catch(() => { /* silencioso */ })
    }

    return updated
  }
}
