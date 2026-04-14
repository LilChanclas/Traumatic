import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { UsuariosService } from '../usuarios/usuarios.service'
import { Rol, Provider } from 'generated/prisma/enums'

function serializeUser(user: any) {
  return {
    id: user.id.toString(),
    nombre: user.nombre,
    apellidos: user.apellidos,
    correo: user.correo,
    rol: user.rol,
    activo: user.activo,
    pendienteAprobacion: user.pendienteAprobacion,
    fotoUrl: user.fotoUrl ?? null,
    createdAt: user.createdAt,
  }
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private usuariosService: UsuariosService) {}

  // GET /admin/usuarios?rol=ADMINISTRATIVO&pendiente=true
  @Get('usuarios')
  async getUsuarios(
    @Query('rol') rol?: string,
    @Query('pendiente') pendiente?: string,
    @Query('activo') activo?: string,
  ) {
    const filters: any = {}
    if (rol) filters.rol = rol
    if (pendiente !== undefined) filters.pendienteAprobacion = pendiente === 'true'
    if (activo !== undefined) filters.activo = activo === 'true'

    const usuarios = await this.usuariosService.findAll(filters)
    return usuarios.map(serializeUser)
  }

  // POST /admin/usuarios — crear usuario manualmente
  @Post('usuarios')
  async createUsuario(
    @Body() body: { nombre: string; apellidos: string; correo: string; rol: Rol },
  ) {
    // Los usuarios creados manualmente quedan activos de inmediato
    const user = await this.usuariosService.createWithRole({
      nombre: body.nombre,
      apellidos: body.apellidos,
      correo: body.correo,
      provider: Provider.MANUAL,
      providerId: body.correo,
      rol: body.rol,
      activo: true,
      pendienteAprobacion: false,
    })
    return serializeUser(user)
  }

  // PATCH /admin/usuarios/:id — editar datos básicos
  @Patch('usuarios/:id')
  async updateUsuario(
    @Param('id') id: string,
    @Body() body: { nombre?: string; apellidos?: string; rol?: Rol },
  ) {
    const user = await this.usuariosService.updateUser(BigInt(id), body)
    return serializeUser(user)
  }

  // PATCH /admin/usuarios/:id/aprobar — aprobar administrativo pendiente
  @Patch('usuarios/:id/aprobar')
  async aprobarAdministrativo(@Param('id') id: string) {
    const user = await this.usuariosService.findById(BigInt(id))
    if (!user) throw new NotFoundException('Usuario no encontrado')
    const updated = await this.usuariosService.aprobar(BigInt(id))
    return serializeUser(updated)
  }

  // PATCH /admin/usuarios/:id/desactivar — desactivar cuenta
  @Patch('usuarios/:id/desactivar')
  async desactivarUsuario(@Param('id') id: string) {
    const user = await this.usuariosService.findById(BigInt(id))
    if (!user) throw new NotFoundException('Usuario no encontrado')
    const updated = await this.usuariosService.desactivar(BigInt(id))
    return serializeUser(updated)
  }

  // PATCH /admin/usuarios/:id/activar — reactivar cuenta
  @Patch('usuarios/:id/activar')
  async activarUsuario(@Param('id') id: string) {
    const user = await this.usuariosService.findById(BigInt(id))
    if (!user) throw new NotFoundException('Usuario no encontrado')
    const updated = await this.usuariosService.aprobar(BigInt(id))
    return serializeUser(updated)
  }
}
