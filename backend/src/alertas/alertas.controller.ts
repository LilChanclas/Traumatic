import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
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
    tramite: a.tramite
      ? {
          idTramite: a.tramite.idTramite.toString(),
          folio: a.tramite.folio,
          tipoTramite: a.tramite.tipoTramite ?? null,
        }
      : null,
    adminResponde: a.adminResponde ?? null,
  }
}

@Controller('alertas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ALUMNO')
export class AlertasController {
  constructor(private readonly service: AlertasService) {}

  @Post()
  async crear(
    @Body() body: { asunto: string; descripcion: string; idTramite?: string },
    @CurrentUser() user: { id: string },
  ) {
    const alerta = await this.service.crearAlerta(
      BigInt(user.id),
      body.asunto,
      body.descripcion,
      body.idTramite ? BigInt(body.idTramite) : undefined,
    )
    return serializeAlerta(alerta)
  }

  @Get('mis-alertas')
  async misAlertas(@CurrentUser() user: { id: string }) {
    const alertas = await this.service.misAlertas(BigInt(user.id))
    return alertas.map(serializeAlerta)
  }
}
