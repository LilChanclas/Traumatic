import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AlertasService {
  constructor(private readonly prisma: PrismaService) {}

  async crearAlerta(idAlumno: bigint, asunto: string, descripcion: string, idTramite?: bigint) {
    if (idTramite) {
      const tramite = await this.prisma.tramite.findUnique({ where: { idTramite } })
      if (!tramite) throw new NotFoundException('Trámite no encontrado')
      if (tramite.idUsuarioSolicitante !== idAlumno)
        throw new ForbiddenException('No tienes acceso a ese trámite')
    }

    return this.prisma.alerta.create({
      data: { idAlumno, asunto, descripcion, idTramite: idTramite ?? null },
      include: { tramite: { select: { folio: true, idTramite: true, estado: true, createdAt: true, tipoTramite: { select: { nombre: true } } } } },
    })
  }

  async misAlertas(idAlumno: bigint) {
    return this.prisma.alerta.findMany({
      where: { idAlumno },
      include: {
        tramite: { select: { folio: true, idTramite: true, estado: true, createdAt: true, tipoTramite: { select: { nombre: true } } } },
        adminResponde: { select: { nombre: true, apellidos: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async listarTodasAlertas(estado?: string, page = 1, pageSize = 20) {
    const where = estado ? { estado: estado as any } : {}
    const [data, total] = await Promise.all([
      this.prisma.alerta.findMany({
        where,
        include: {
          alumno: { select: { nombre: true, apellidos: true, correo: true } },
          tramite: { select: { folio: true, idTramite: true, estado: true, createdAt: true, tipoTramite: { select: { nombre: true } } } },
          adminResponde: { select: { nombre: true, apellidos: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.alerta.count({ where }),
    ])
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
  }

  async marcarVista(idAlerta: bigint) {
    const alerta = await this.prisma.alerta.findUnique({ where: { idAlerta } })
    if (!alerta) throw new NotFoundException('Alerta no encontrada')
    if (alerta.estado !== 'PENDIENTE') return alerta
    return this.prisma.alerta.update({
      where: { idAlerta },
      data: { estado: 'VISTA' },
      include: {
        alumno: { select: { nombre: true, apellidos: true, correo: true } },
        tramite: { select: { folio: true, idTramite: true, estado: true, createdAt: true, tipoTramite: { select: { nombre: true } } } },
        adminResponde: { select: { nombre: true, apellidos: true } },
      },
    })
  }

  async responderAlerta(idAlerta: bigint, idAdmin: bigint, respuesta: string) {
    const alerta = await this.prisma.alerta.findUnique({ where: { idAlerta } })
    if (!alerta) throw new NotFoundException('Alerta no encontrada')
    return this.prisma.alerta.update({
      where: { idAlerta },
      data: {
        respuesta,
        estado: 'RESPONDIDA',
        idAdminResponde: idAdmin,
        respondidaAt: new Date(),
      },
      include: {
        alumno: { select: { nombre: true, apellidos: true, correo: true } },
        tramite: { select: { folio: true, idTramite: true, estado: true, createdAt: true, tipoTramite: { select: { nombre: true } } } },
        adminResponde: { select: { nombre: true, apellidos: true } },
      },
    })
  }
}
