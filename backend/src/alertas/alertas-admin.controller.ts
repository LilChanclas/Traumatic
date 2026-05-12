import { Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Patch, Query, UseGuards } from '@nestjs/common'
import { AlertasService } from './alertas.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

function serializeAlerta(a: any) {
  return {
    idAlerta: a.idAlerta.toString(),
    asunto: a.asunto,
    descripcion: a.descripcion,
    estado: a.estado,
    respuesta: a.respuesta ?? null,
    respondidaAt: a.respondidaAt ?? null,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
    alumno: a.alumno
      ? { nombre: a.alumno.nombre, apellidos: a.alumno.apellidos, correo: a.alumno.correo }
      : null,
    tramite: a.tramite
      ? {
          idTramite: a.tramite.idTramite.toString(),
          folio: a.tramite.folio,
          estado: a.tramite.estado,
          createdAt: a.tramite.createdAt,
          tipoTramite: a.tramite.tipoTramite ?? null,
        }
      : null,
    adminResponde: a.adminResponde ?? null,
  }
}

@Controller('administrativo/alertas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMINISTRATIVO')
export class AlertasAdminController {
  constructor(private readonly service: AlertasService) {}

  @Get()
  async listar(
    @Query('estado') estado?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize?: number,
  ) {
    const result = await this.service.listarTodasAlertas(estado, page, pageSize)
    return {
      data: result.data.map(serializeAlerta),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    }
  }

  @Patch(':id/vista')
  async marcarVista(@Param('id') id: string) {
    const alerta = await this.service.marcarVista(BigInt(id))
    return serializeAlerta(alerta)
  }

  @Patch(':id/responder')
  async responder(
    @Param('id') id: string,
    @Body() body: { respuesta: string },
    @CurrentUser() user: { id: string },
  ) {
    const alerta = await this.service.responderAlerta(BigInt(id), BigInt(user.id), body.respuesta)
    return serializeAlerta(alerta)
  }
}
