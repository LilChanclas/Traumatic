import { Body, Controller, Get, Param, Patch, Query, UseGuards, ParseIntPipe, DefaultValuePipe } from '@nestjs/common'
import { AdministrativoService } from './administrativo.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { EstadoTramite } from 'generated/prisma/enums'

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
    usuario: t.usuario
      ? {
          id: t.usuario.id.toString(),
          nombre: t.usuario.nombre,
          apellidos: t.usuario.apellidos,
          correo: t.usuario.correo,
          fotoUrl: t.usuario.fotoUrl ?? null,
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

@Controller('administrativo/tramites')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMINISTRATIVO')
export class AdministrativoController {
  constructor(private readonly service: AdministrativoService) {}

  @Get()
  async findAll(
    @Query('estado') estado?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize?: number,
  ) {
    const result = await this.service.findAll(estado, page, pageSize)
    return {
      data:       result.data.map(serializeTramite),
      total:      result.total,
      page:       result.page,
      pageSize:   result.pageSize,
      totalPages: result.totalPages,
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const tramite = await this.service.findById(BigInt(id))
    return serializeTramite(tramite)
  }

  @Patch(':id/estado')
  async cambiarEstado(
    @Param('id') id: string,
    @Body() body: { estado: EstadoTramite; comentario?: string },
    @CurrentUser() user: { id: string },
  ) {
    const tramite = await this.service.cambiarEstado(
      BigInt(id),
      BigInt(user.id),
      body.estado,
      body.comentario,
    )
    return serializeTramite(tramite)
  }
}
