import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { TramitesService } from './tramites.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

function serializeTramite(t: any) {
  return {
    idTramite: t.idTramite.toString(),
    folio: t.folio,
    estado: t.estado,
    comentariosAlumno: t.comentariosAlumno ?? null,
    motivoRechazo: t.motivoRechazo ?? null,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    tipoTramite: t.tipoTramite
      ? {
          idTipo: t.tipoTramite.idTipo.toString(),
          nombre: t.tipoTramite.nombre,
          descripcion: t.tipoTramite.descripcion ?? null,
          docsRequeridos: t.tipoTramite.docsRequeridos ?? [],
        }
      : undefined,
    documentos: t.documentos?.map((d: any) => ({
      idDocumento: d.idDocumento.toString(),
      nombreArchivo: d.nombreArchivo,
      rutaAlmacenamiento: d.rutaAlmacenamiento,
      tipoMime: d.tipoMime,
      tamanioBytes: d.tamanioBytes,
      createdAt: d.createdAt,
    })),
    historial: t.historial?.map((h: any) => ({
      idHistorial: h.idHistorial.toString(),
      estadoAnterior: h.estadoAnterior ?? null,
      estadoNuevo: h.estadoNuevo,
      comentario: h.comentario ?? null,
      createdAt: h.createdAt,
      usuario: h.usuario
        ? { nombre: h.usuario.nombre, apellidos: h.usuario.apellidos, rol: h.usuario.rol }
        : undefined,
    })),
  }
}

@Controller('tramites')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ALUMNO')
export class TramitesController {
  constructor(private readonly service: TramitesService) {}

  @Post()
  async create(
    @Body() body: { idTipoTramite: string; comentariosAlumno?: string },
    @CurrentUser() user: { id: string },
  ) {
    const tramite = await this.service.create(
      BigInt(user.id),
      BigInt(body.idTipoTramite),
      body.comentariosAlumno,
    )
    return serializeTramite(tramite)
  }

  @Get('mis-tramites')
  async misTramites(@CurrentUser() user: { id: string }) {
    const tramites = await this.service.findMisTramites(BigInt(user.id))
    return tramites.map(serializeTramite)
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    const tramite = await this.service.findById(BigInt(id), BigInt(user.id))
    return serializeTramite(tramite)
  }
}
