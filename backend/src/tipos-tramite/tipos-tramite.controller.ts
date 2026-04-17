import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { TiposTramiteService } from './tipos-tramite.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'

function serialize(t: any) {
  return {
    idTipo: t.idTipo.toString(),
    nombre: t.nombre,
    descripcion: t.descripcion ?? null,
    docsRequeridos: (t.docsRequeridos as string[]) ?? [],
    activo: t.activo,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }
}

@Controller('admin/tipos-tramite')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class TiposTramiteController {
  constructor(private readonly service: TiposTramiteService) {}

  @Get()
  async findAll() {
    const tipos = await this.service.findAll()
    return tipos.map(serialize)
  }

  @Post()
  async create(
    @Body() body: { nombre: string; descripcion?: string; docsRequeridos?: string[] },
  ) {
    return serialize(await this.service.create(body))
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { nombre?: string; descripcion?: string; docsRequeridos?: string[] },
  ) {
    return serialize(await this.service.update(BigInt(id), body))
  }

  @Patch(':id/activar')
  async activar(@Param('id') id: string) {
    return serialize(await this.service.activar(BigInt(id)))
  }

  @Patch(':id/desactivar')
  async desactivar(@Param('id') id: string) {
    return serialize(await this.service.desactivar(BigInt(id)))
  }
}
